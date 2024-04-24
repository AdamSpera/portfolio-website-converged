<div style="margin-bottom: 2ch;text-transform: none;">
January 8th, 2024</div>

# Virtual Extensible LAN (VXLAN)

VXLAN, or Virtual Extensible LAN, is a network technology that allows us to create a logical network for virtual machines, across different networks. In simpler terms, it extends a LAN (L2) to include machines that are physically on different networks.

Imagine you have two computers in different cities, but you want them to behave as if they're on the same local network. VXLAN can help you do that. It encapsulates the original data packets, sending them through a 'tunnel' to the destination, where they're de-encapsulated and processed normally. This tunneling process is invisible to the computers, so they behave as if they're on the same network.

The key components of VXLAN are:

- **VXLAN Tunnel End Point (VTEP)**: This is the entity where encapsulation and de-encapsulation of VXLAN packets occur.

- **Virtual Network Identifier (VNI)**: This is used to identify the VXLAN segment. Each segment has a unique VNI.

- **Network Virtualization Edge (NVE)**: This refers to the device doing the encapsulation and de-encapsulation.

- **Ethernet Virtual Private Network (EVPN)**: This is often used with VXLAN for routing and control plane operations.

Remember, VXLAN requires a larger MTU size (9216/9214 bytes) due to the extra VXLAN headers.

<table>
  <tr>
    <th>Term</th>
    <th>Definition</th>
  </tr>
  <tr>
    <td>VXLAN</td>
    <td>Virtual Extensible LAN</td>
  </tr>
  <tr>
    <td>VTEP</td>
    <td>VXLAN Tunnel End Point</td>
  </tr>
  <tr>
    <td>VNI</td>
    <td>Virtual Network Identifier</td>
  </tr>
  <tr>
    <td>NVE</td>
    <td>Network Virtualization Edge</td>
  </tr>
  <tr>
    <td>EVPN</td>
    <td>Ethernet Virtual Private Network</td>
  </tr>
</table>

## Configuration

Remember: MTU 9216 is needed for VXLAN.

### Configurations

**Config Steps Checklist**

<form action="">
  <input type="checkbox" id="option1" name="option1" value="Option1">
  <label for="option1">Features</label><br>
  <input type="checkbox" id="option2" name="option2" value="Option2">
  <label for="option2">Interfaces IPs</label><br>
  <input type="checkbox" id="option3" name="option3" value="Option3">
  <label for="option3">OSPF</label><br>
  <input type="checkbox" id="option3" name="option3" value="Option3">
  <label for="option3">PIM</label><br>
  <input type="checkbox" id="option3" name="option3" value="Option3">
  <label for="option3">MTU</label><br>
  <input type="checkbox" id="option3" name="option3" value="Option3">
  <label for="option3">Switch ports</label><br>
  <input type="checkbox" id="option3" name="option3" value="Option3">
  <label for="option3">VXLAN</label><br>
  <input type="checkbox" id="option3" name="option3" value="Option3">
  <label for="option3">EVPN</label><br>
</form>

<main>![VXLAN Basic](../../../../media/vxlan_base.png)</main>

#### Prerequisites

<pre>
feature ospf
feature bgp
feature pim
feature interface-vlan
feature vn-segment-vlan-based
feature nv overlay
nv overlay evpn
</pre>

#### OSPF Configs

<pre>
<span>Spine</span>
<hr>router ospf 1
!
ip pim rp-address 10.1.1.100
ip pim anycast-rp 10.1.1.100 10.0.0.1
ip pim anycast-rp 10.1.1.100 10.0.0.5
!
interface Ethernet1/1
  no switchport
  mtu 9216
  ip address 10.0.0.1/30
  ip router ospf 1 area 0.0.0.0
  ip pim sparse-mode
  no shutdown
!
interface Ethernet1/2
  no switchport
  mtu 9216
  ip address 10.0.0.5/30
  ip router ospf 1 area 0.0.0.0
  ip pim sparse-mode
  no shutdown
!
interface loopback0
  ip address 10.1.1.100/32
  ip router ospf 1 area 0.0.0.0
  ip pim sparse-mode
</pre>

<pre>
<span>9K-1 & 9K-2</span>
<hr>router ospf 1
!
ip pim rp-address 10.1.1.100
!
interface Ethernet1/3
  no switchport
  mtu 9216
  ip address 10.0.0.2/30
  ip router ospf 1 area 0.0.0.0
  ip pim sparse-mode
  no shutdown
!
interface loopback0
  ip address 10.1.1.1/32
  ip router ospf 1 area 0.0.0.0
  ip pim sparse-mode
</pre>

#### VXLAN Configs

<pre>
<span>9K-1 & 9K-2</span>
<br>vlan 10
  vn-segment 100000
!
interface Eth1/1
  no shutdown
  switchport access vlan 10
!
interface nve1
  no shutdown
  source-interface loopback0
  member vni 100000
    mcast-group 239.1.1.1
</pre>

#### EVPN Configs

<pre>
<span>Spine</span>
<hr>router bgp 65000
  address-family ipv4 unicast
  address-family l2vpn evpn
  neighbor 10.0.0.2
    remote-as 65000
    address-family ipv4 unicast
      route-reflector-client
    address-family l2vpn evpn
      send-community extended
      route-reflector-client
  neighbor 10.0.0.6
    remote-as 65000
    address-family ipv4 unicast
      route-reflector-client
    address-family l2vpn evpn
      send-community extended
      route-reflector-client
</pre>

<pre>
<span>9K-1 & 9K-2</span>
<hr>evpn
  vni 100000 l2
    rd auto
    route-target both auto
!
fabric forwarding anycast-gateway-mac a.a.a
!
vlan 333
  vn-segment 333333
!
vrf context VXVRF
  vni 333333
  rd auto
  address-family ipv4 unicast
    route-target both auto
    route-target both auto evpn
!
interface vlan 10
  no shutdown
  vrf member VXVRF
  ip address 10.10.10.1/24
  fabric forwarding mode anycast-gateway
!
interface vlan 333
  no shutdown
  vrf member VXVRF
  ip forward
!
interface nve 1
  host-reachability protocol bgp
  member vni 333333 associate-vrf
!
route-map PERMIT_ALL permit 10
!
interface loopback 1
  no shutdown
  ip address 1.1.1.1/32
!
router bgp 65000
  address-family ipv4 unicast
    network 1.1.1.1/32
  address-family l2vpn evpn
  neighbor 10.0.0.1
    remote-as 65000
    address-family ipv4 unicast
    address-family l2vpn evpn
      send-community extended
  vrf VXVRF
    address-family ipv4 unicast
      redistribute direct route-map PERMIT_ALL
</pre>

#### Verification

<pre>
show nve peers
show vxlan
</pre>

