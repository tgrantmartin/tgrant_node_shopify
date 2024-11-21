// Import necessary packages
require('dotenv').config();
const { SHOPIFY_STORE_URL, ADMIN_TOKEN } = process.env;
const fetch = require('node-fetch');

// Shopify GraphQL endpoint
const graphqlEndpoint = `https://${SHOPIFY_STORE_URL}/admin/api/2023-01/graphql.json`;

const args = require('process');

// GraphQL query to fetch products
let query_first = ''
if (args.argv[3]) {
    query_first = `, query:"title:`+args.argv[3]+`*"`
}
const query = `
  {
    products(first:10`+query_first+`) {
      edges {
        node {
          id
          title
          handle
          description
          variants(first:10) {
            edges {
              node {
                id
                title
                price
              }
            }
          }
        }
      }
    }
  }
`;
// Make a GraphQL request to Shopify
fetch(graphqlEndpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ query }),
})
    .then(response => response.json())
    .then(data => {
        // Handle the GraphQL response here
        let output = [];
        for(const product of data.data.products.edges) {
            let variants = product.node.variants;
            for(const variant of variants.edges) {
                let line = [];
                line['title'] = product.node.title
                line['variant_title'] = variant.node.title;
                line['variant_price'] = variant.node.price;
                output.push(line);
            }
        }
        output.sort((a, b) => a.variant_price - b.variant_price).reverse();
        for(const product of output) {
            console.log(product.title + ' - ' + product.variant_title + ' - ' + product.variant_price);
        }
    })
    .catch(error => console.error('Error fetching products:', error));
