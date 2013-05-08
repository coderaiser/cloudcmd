#!/bin/sh
su iptables -t nat -L # look rules before
su iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000
su iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 4430
su iptables -t nat -L # look reles after

#su iptables -t nat -D PREROUTING 1
#su iptables -t nat -D PREROUTING 2