echoipdns DNS Server for Wildcard domains based development
===========

Forked from fasterize/olodum (https://github.com/fasterize/olodum). Thanks for the great work done by stefounet(https://github.com/stefounet).
Publishing this as separate project since I feel focus of this project is little different from original project from stefounet.

The entire core logic is changed now and migrated to use native-dns module (https://github.com/tjfontaine/node-dns)

echoipdns is Proxy DNS Server for development with wild card domains, and special echo capability of ip address from domain name.

We needed a way to use wildcard domain DNS in our dev environment. The requirements are,

1. Work on local machine as well as central server (Can use it in disconnected mode or from office central server).
2. Can be used by any developer / tester to access there own system or someone else's system for development with wild card domain names without explicitly provisioning the domain in DNS.
   i.e if Dev 1 needs to access Dev 2 system, (typically all solutions required provisioning the other system IP in the DNS, or some solutions always returned 127.0.0.1 for any domain.)
3. Can be used across Mac, Linux, Windows

The solution,

The DNS server echos the ip address in the domain,

i.e. if My domain ends with .development, I can do the following,

127-0-0-1.development will return A record as 127.0.0.1

192-168-0-123.development will return A record as 192.168.0.123


Also I could combine this with any other wildcard

xyz.127-0-0-1.development will always return 127.0.0.1 (xyz could be any valid domain part here)

xyz.192-168-0-123.development will return A record as 192.168.0.123


Hence if this server is run locally you can access any ip (even of remote developer) and use his/here system with wildcard domain support with zero configuration.

For working with mobile devices you can run this on a server and point DNS of mobile device to it. For running this as a service I would recommend using forever-service (https://www.npmjs.com/package/forever-service)

Installation
============

Echo IP DNS should be installed globally, also make sure git is installed in your system

    [sudo] npm install echoipdns -g


Supported env
------------
* linux (ubuntu,debian)
* macosx
* windows (Some manual steps are required to make it work though)


Usage
=====

    [sudo] echoipdns [domainkey] -f [forwardDNS]

where :

* domainkey is the filter like 'development' in the example above, defaults to blank (=> every DNS requests is catched).
* If the domainkey is not specified all requests are routed to 127.0.0.1
* Domains with following format ip.domainkey (. replaced with - in ip ) will be return the IP address as A records
* Forward DNS -f, By default echoipdns works forwards all non catched queries to your top most DNS server in the OS, but if you dont want to do that you can give your own forward DNS ip.
NOTE: In Windows you must give -f and provide forward DNS since at the moment echo ip DNS does not read the default DNS and does not provision itself as DNS server.

olodum original command line options may also work, but they are not documented here, not tested.

sudo is needed to bind to local port 53 (DNS server)

You should be able to surf as usual, except for the filtered domain name(s).
When you are finished, just type ````Ctrl + C```` to exit and revert to the previous and original DNS configuration of your box.


Examples
========

To run it in Mac/Linux system give following command,

    [sudo] echoipdns development

Above command will change your current DNS server, and forward non development requests (Domain names not having word development in them) to original server.
Requests such as 127-0-0-1.development or 10-10-10-250.development etc. i.e. having valid ip in second part of domain will return the correspnding ip as A record.
When you are done just type ````Ctrl + C```` to exit and revert to the previous and original DNS configuration of your box.



To run it in Windows systems, You can either run this on the same machine or a remote machine (Look at next section)

    [sudo] echoipdns development -f 8.8.8.8

Above command will start a DNS server and forward all non development requests to 8.8.8.8, 8.8.8.8 can be replaced with your own DNS server.
Once this server is up and running, you need to manually point to 127.0.0.1 (or the ip of where this server is running) in your network configuration.



To run it in Linux servers as a service for Mobile devices / Remote Windows systems,

    [sudo] npm install -g forever-service
    sudo forever-service install echoipdns -s /usr/bin/echoipdns -o "development -f 192.168.6.50"
    [sudo] service echoipdns start                   (NOTE: look at exact start command returned by forever-service)

Now you can point to this DNS server for wildcard echo ip domains.


Inner working
=============
##linux
1. read and backup /etc/resolv.conf
2. write a new /etc/resolv.conf with 127.0.0.1 as the DNS server
3. start the DNS server
4. serve DNS responses based on filter or forward the request to the first DNS server detected in /etc/resolv.conf

##macosx
1. read and backup /etc/resolv.conf
2. change the network configuration with 127.0.0.1 as the DNS server
3. start the DNS server
4. serve DNS responses based on filter or forward the request to the first DNS server detected in /etc/resolv.conf

Thanks
======
Virtual CTO (https://virtualcto.in)

This module is fork of fasterize/olodum (https://github.com/fasterize/olodum) and based on native-dns module (https://github.com/tjfontaine/node-dns)
