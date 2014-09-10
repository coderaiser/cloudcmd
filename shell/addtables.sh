#!/bin/sh
sudo iptables -t nat -L # look rules before
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000
sudo iptables -t nat -L # look reles after

#sudo iptables -t nat -D PREROUTING 1
#sudo iptables -t nat -D PREROUTING 2