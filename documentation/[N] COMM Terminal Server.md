<div style="margin-bottom: 2ch;text-transform: none;">
April 24th, 2024</div>

# COMM Terminal Server

A communications server, otherwise known as access server or terminal server, commonly provides out-of-band access for multiple devices. A comm server is a router with multiple, low-speed, asynchronous ports that are connected to other serial devices, such as modems or console ports on routers or switches.

The comm server allows you to use a single point to access the console ports of many devices. Using a comm server avoids the need for configuring backup scenarios such as modems on auxiliary ports for every device.

# [Config] Reverse Telnet

Reverse Telnet is a method of connecting to a device's console port through a comm server. The comm server acts as a reverse telnet server, and the device acts as a reverse telnet client.

<code>R1</code>
<pre>
ip host Cable3 2053 10.0.0.1

interface GigabitEthernet0/0
  description Telnet Endpoint
  ip address 10.0.0.1 255.255.255.254

line vty 0 15
 session-timeout 15 
 transport preferred telnet
 transport input all
 transport output all

line 0/3/1 0/3/15
 session-timeout 20
 session-limit 1
 transport input all
 transport output all
</pre>

To test the connection, use the following command: <code>telnet 10.0.0.30 2053</code>.

# [Config] Full Working Config

<code>R1</code>
<pre>
IP Address --> 192.168.128.20
SSH Credentials: admin cisco

Comm Cable
3 (line 2053) --> C9300
4 (line 2054) --> C3850-1
5 (line 2055) --> C3850-2

telnet 192.168.128.20 2053
END SESSION: CTRL-SHIFT+6+X

COMM-SERVER#sh line
   Tty Line Typ     Tx/Rx    A Modem  Roty AccO AccI  Uses  Noise Overruns  Int
*     0    0 CTY              -    -      -    -    -     0      0    0/0      -
      1    1 AUX   9600/9600  -    -      -    -    -     0      0    0/0      -
  0/3/0   50 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
  0/3/1   51 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
  0/3/2   52 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
(First cable (#3)) * 0/3/3   53 TTY   9600/9600  -    -      -    -    -     3      4    0/0      -
  0/3/4   54 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
  0/3/5   55 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
  0/3/6   56 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
  0/3/7   57 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
  0/3/8   58 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
  0/3/9   59 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
 0/3/10   60 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
 0/3/11   61 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
 0/3/12   62 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
 0/3/13   63 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
 0/3/14   64 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
 0/3/15   65 TTY   9600/9600  -    -      -    -    -     0      0    0/0      -
*   194  194 VTY              -    -      -    -    -     3      0    0/0      -
    195  195 VTY              -    -      -    -    -     0      0    0/0      -
    196  196 VTY              -    -      -    -    -     0      0    0/0      -
    197  197 VTY              -    -      -    -    -     0      0    0/0      -
    198  198 VTY              -    -      -    -    -     0      0    0/0      -

First Show Run Build
COMM-SERVER#show run
Building configuration...

Current configuration : 2829 bytes
!
! No configuration change since last restart
version 15.1
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
hostname COMM-SERVER
!
boot-start-marker
boot-end-marker
!
!
!
no aaa new-model
!
dot11 syslog
ip source-route
!
!
!
!
!
ip cef
no ip domain lookup
ip domain name cisco.com
no ipv6 cef
!
multilink bundle-name authenticated
!
!
!
!
!
!
!
!
!
!
!
voice-card 0
!
crypto pki token default removal timeout 0
!
!
!
!
license udi pid CISCO2801 sn FTX123420D4
username admin privilege 15 password 0 cisco
!
redundancy
!
!         
ip ssh version 2
! 
!
!
!
!
!
!
!
interface Loopback0
 no ip address
 shutdown
!
interface FastEthernet0/0
 ip address 192.168.128.20 255.255.255.0
 duplex auto
 speed auto
!
interface FastEthernet0/1
 no ip address
 shutdown
 duplex auto
 speed auto
!
interface Async0/3/0
 no ip address
 encapsulation slip
!
interface Async0/3/1
 no ip address
 encapsulation slip
!
interface Async0/3/2
 no ip address
 encapsulation slip
!
interface Async0/3/3
 no ip address
 encapsulation slip
!
interface Async0/3/4
 no ip address
 encapsulation slip
!
interface Async0/3/5
 no ip address
 encapsulation slip
!
interface Async0/3/6
 no ip address
 encapsulation slip
!
interface Async0/3/7
 no ip address
 encapsulation slip
!
interface Async0/3/8
 no ip address
 encapsulation slip
!
interface Async0/3/9
 no ip address
 encapsulation slip
!
interface Async0/3/10
 no ip address
 encapsulation slip
!
interface Async0/3/11
 no ip address
 encapsulation slip
!
interface Async0/3/12
 no ip address
 encapsulation slip
!
interface Async0/3/13
 no ip address
 encapsulation slip
!
interface Async0/3/14
 no ip address
 encapsulation slip
!
interface Async0/3/15
 no ip address
 encapsulation slip
!
ip forward-protocol nd
no ip http server
no ip http secure-server
!
!
!
ip access-list extended TELALLOW
 permit 23 any any
 permit icmp any any
!
access-list dynamic-extended
!
!
!
!
!
!
control-plane
!
!         
!
!
mgcp profile default
!
!
!
!
!
!
line con 0
line aux 0
line 0/3/0
 session-timeout 10 
 transport input all
 transport output all
line 0/3/1 0/3/15
 session-timeout 20 
 exec-timeout 20 0
 session-limit 1
 no exec
 transport input all
 transport output all
line vty 0
 session-timeout 15 
 exec-timeout 15 0
 password cisco!123
 login local
 transport preferred telnet
 transport input all
 transport output all
line vty 1 4
 session-timeout 15 
 exec-timeout 15 0
 login local
 transport preferred telnet
 transport input all
 transport output all
line vty 5 15
 session-timeout 15 
 login local
 transport preferred telnet
 transport input all
 transport output all
line vty 16 259
 session-timeout 15 
 session-limit 1
 no login
 no exec
 transport preferred telnet
 transport input all
 transport output all
!
scheduler allocate 20000 1000
end
</pre>