// @ts-nocheck
import dgram from 'node:dgram'
import dnsPacket from 'dns-packet'
import fetch from 'node-fetch'

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.error(`Server error:\n${err.stack}`);
    server.close();
});

server.on('message', async (msg, rinfo) => {
    let response;

    try {
        const query = dnsPacket.decode(msg);

        if (query.questions && query.questions[0].name !== "") {

            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer zj5jyr4wqps4xfaiviy5`
                },
                body: JSON.stringify({ domain: query.questions[0].name, type: query.questions[0].type })
            };

            try {
                const fetchResponse = await fetch(`https://ns-cache.fromafri.ca/dns-query`, requestOptions);
                    if (fetchResponse.ok) {

                        const fres = await fetchResponse.json();

                        if (fres.status === "404") {
                            throw({message: 'Unknown domain name', query: query})
                        }

                        if (fres.status === "500") {
                            throw({message: 'Error handling DNS query', query: query})
                        }

                        if (fres.status === "200") {

                            console.log(fres);
                            
                            // Respond authoritatively
                            let obj = {
                                type: 'response',
                                id: query.id,
                                questions: query.questions,
                                flags: dnsPacket.AUTHORITATIVE_ANSWER,
                                answers: [{
                                    type: fres.record.type,
                                    class: 'IN',
                                    name: fres.query,
                                    ttl: fres.record.ttl,
                                    data: fres.record.record // for A record, it's a string containing IP, for MX record, it's an array of objects
                                }],
                            };
                            response = dnsPacket.encode(obj);

                        } else {
                            throw({message: 'unknown DNS query error', query: query})
                        }

                    } else {
                        throw({message: 'fetch failed', query: query})
                    }
            } catch (err) {
                // bubble up error to outer catch block
                throw ({message: err.message || 'unknown error', query: err.query})
            }
        } else {
            throw({message: 'invalid query', query: query})
        }

        server.send(response, rinfo.port, rinfo.address);
    } catch (error) {
        console.error(error.message || 'unknown error');

        // For other domains, return NXDOMAIN
        response = dnsPacket.encode({
            type: 'response',
            id: error.query.id || '',
            questions: error.query.questions || '',
            flags: 3
        });
        server.send(response, rinfo.port, rinfo.address);
    }
});


server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening on ${address.address}:${address.port}`);
});

server.bind(3053, '0.0.0.0');
