<div style="margin-bottom: 2ch;text-transform: none;">
April 24th, 2024</div>

# Virtual Extensible LAN (VXLAN)

Virtual Extensible LAN (VXLAN) provides a way to extend Layer 2 networks across a Layer 3 infrastructure using MAC-in-UDP encapsulation and tunneling. This allows for the creation of logical Layer 2 networks on top of a Layer 3 network. VXLAN is defined in [RFC 7348](https://tools.ietf.org/html/rfc7348).

VXLAN uses a 24-bit segment ID, the VXLAN network identifier (VNID). This allows a maximum of 16 million VXLAN segments to coexist in the same administrative domain. In comparison, traditional VLANs use a 12-bit segment ID that can support a maximum of 4096 VLANs.

<img src="documentation/media/vxlan_packet.png" class="border">
VXLAN Packet Format

# VXLAN Tunnel Endpoint

VXLAN tunnel endpoints (VTEPs) are devices that terminate VXLAN tunnels. They perform VXLAN encapsulation and de-encapsulation. Each VTEP has two interfaces. One is a Layer 2 interface on the local LAN segment to support a local endpoint communication through bridging. The other is a Layer 3 interface on the IP transport network.

The IP interface has a unique address that identifies the VTEP device in the transport network. The VTEP device uses this IP address to encapsulate Ethernet frames and transmit the packets on the transport network. A VTEP discovers other VTEP devices that share the same VNIs it has locally connected.

# Distributed Anycast Gateway

Distributed Anycast Gateway refers to the use of default gateway addressing that uses the same IP and MAC address across all the leafs that are a part of a VNI. This ensures that every leaf can function as the default gateway for the workloads directly connected to it. 

# Control Plane Types

There are two widely adopted control planes that are used with VXLAN:

**Flood and Learn Multicast-Based Learning**

- When configuring VXLAN with a multicast based control plane, every VTEP configured with a specific VXLAN VNI joins the same multicast group. Each VNI could have its own multicast group, or several VNIs can share the same group. 
- The multicast group is used to forward broadcast, unknown unicast, and multicast (BUM) traffic for a VNI.

**VXLAN Multi-Protocol BGP EVPN**

With this type, flooding is reduced by distributing MAC reachability information via MP-BGP EVPN to optimize flooding relating to L2 unknown unicast traffic. Optimization of reducing broadcasts associated with ARP/IPv6 Neighbor solicitation is achieved by distributing the necessary information via MPBGP EVPN. The information is then cached at the access switches. Address solicitation requests can be responded locally without sending a broadcast to the rest of the fabric.

# [Config] Underlay

<img src="documentation/media/vxlan_underlay.png" class="border">
Underlay Network Topology

In the above image, the leaf switches (V1 and V2) are at the middle of the image. They are connected to the 1 spine switch (S1) that are depicted at the top of the image.

First step of configuring VXLAN is establishing a underlay network. In this example we will use OSPF and PIM Anycast.

<div style="width: 49%; float: left;">

<code>[V1]</code>
<pre>
feature ospf
feature pim

ip pim rp-address 10.1.1.100

router ospf UNDERLAY

interface Ethernet 1/3
  description Link to Spine S1
  no switchport
  ip address 10.0.0.2/31
  mtu 9192
  ip router ospf UNDERLAY area 0.0.0.0
  ip ospf network point-to-point
  ip pim sparse-mode
  no shutdown

interface Loopback 0
  ip address 10.1.1.1/32
  ip router ospf UNDERLAY area 0.0.0.0
  ip pim sparse-mode
  no shutdown
</pre>

</div>
<div style="width: 49%; float: right;">

<code>[V2]</code>
<pre>
feature ospf
feature pim

ip pim rp-address 10.1.1.100

router ospf UNDERLAY

interface Ethernet 1/3
  description Link to Spine S1
  no switchport
  ip address 10.0.0.6/31
  mtu 9192
  ip router ospf UNDERLAY area 0.0.0.0
  ip ospf network point-to-point
  ip pim sparse-mode
  no shutdown

interface Loopback 0
  ip address 10.1.1.2/32
  ip router ospf UNDERLAY area 0.0.0.0
  ip pim sparse-mode
  no shutdown
</pre>

</div>

<code>[S1]</code>
<pre>
feature ospf
feature pim

ip pim rp-address 10.1.1.100
ip pim anycast-rp 10.1.1.100 10.0.0.1
ip pim anycast-rp 10.1.1.100 10.0.0.5

router ospf UNDERLAY

interface Ethernet 1/1
  description Link to VTEP V1
  no switchport
  ip address 10.0.0.1/31
  mtu 9192
  ip router ospf UNDERLAY area 0.0.0.0
  ip ospf network point-to-point
  ip pim sparse-mode
  no shutdown

interface Ethernet 1/2
  description Link to VTEP V2
  no switchport
  ip address 10.0.0.5/31
  mtu 9192
  ip router ospf UNDERLAY area 0.0.0.0
  ip ospf network point-to-point
  ip pim sparse-mode
  no shutdown

interface Loopback 0
  ip address 10.1.1.100/32
  ip router ospf UNDERLAY area 0.0.0.0
  ip pim sparse-mode
  no shutdown
</pre>

To verify the OSPF configurations, check the OSPF neighbourships and databases with <code>show ip ospf neighbors</code> and <code>show ip ospf database</code> respectively. This should return confirmations that the OSPF adjacencies are up and the databases are synchronized.

To verify the PIM configuration, check the PIM neighbourships with <code>show ip pim rp</code>. This should return confirmations that the PIM adjacencies are up.

# [Config] Overlay (Flood and Learn)

In the following command snippets, we will configure switchports that are configured with VLAN 10 to be part of the VNI 12345 VLAN. The VTEP interfaces are configured such that the VNI 123456 is part of the 239.1.1.1 multicast group.

<div style="width: 49%; float: left;">

<code>[V1]</code>
<pre>
feature vn-segment-vlan-based

vlan 10
  vn-segment 123456

interface Eth1/1
  no shutdown
  switchport access vlan 10

interface nve1
  no shutdown
  source-interface loopback0
  member vni 123456
    mcast-group 239.1.1.1
</pre>

</div>
<div style="width: 49%; float: right;">

<code>[V2]</code>
<pre>
feature vn-segment-vlan-based

vlan 10
  vn-segment 123456

interface Eth1/1
  no shutdown
  switchport access vlan 10

interface nve1
  no shutdown
  source-interface loopback0
  member vni 123456
    mcast-group 239.1.1.1
</pre>

</div>

To verify the VXLAN configuration, check the VXLAN tunnel status with <code>show nve peers</code>, <code>show nve vni</code>, <code>show vxlan</code>. This should return confirmations that the VXLAN tunnels are up and the VNIs are configured correctly.

# [Config] Overlay (MP-BGP EVPN)

