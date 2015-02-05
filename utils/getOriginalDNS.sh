#!/bin/sh
SERVICE_GUID=`
    echo -e "open\nget State:/Network/Global/IPv4\nd.show" |
    scutil |
    awk '/PrimaryService/{print $3}'
`

CONFIG_METHOD=`
    echo -e "open\nget Setup:/Network/Service/$SERVICE_GUID/IPv4\nd.show" |
    scutil |
    awk -F': ' '/ConfigMethod/{print $2}'
`

if [ "$CONFIG_METHOD" == "Manual" ]; then
  grep "nameserver" /etc/resolv.conf.orig | grep -o "[0-9]*\\.[0-9]*\\.[0-9]*\\.[0-9]*" | xargs -n 2 | awk '{ print $1" "$2 }'
fi

if [ "$CONFIG_METHOD" == "" ]; then
  grep "nameserver" /etc/resolv.conf.orig | grep -o "[0-9]*\\.[0-9]*\\.[0-9]*\\.[0-9]*" | xargs -n 2 | awk '{ print $1" "$2 }'
fi

if [ "$CONFIG_METHOD" == "DHCP" ]; then
  echo "Empty"
fi


