#!/bin/sh
SERVICE_GUID=`
    echo -e "open\nget State:/Network/Global/IPv4\nd.show" |
    scutil |
    awk '/PrimaryService/{print $3}'
`

SERVICE_NAME=`
    echo -e "open\nget Setup:/Network/Service/$SERVICE_GUID\nd.show" |
    scutil |
    awk -F': ' '/UserDefinedName/{print $2}'
`

echo $SERVICE_NAME
