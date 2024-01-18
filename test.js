import fs from 'fs';
import dnsPacket from 'dns-packet';
const query = dnsPacket.encode({
  type: 'query',
  id: 1, // Random ID
  questions: [{
    type: 'CNAME',
    name: 'jynx.fromafri.ca'
  }]
});

fs.writeFileSync('dns-query.bin', query);