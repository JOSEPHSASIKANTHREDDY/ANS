const request=require('request')
let credentials={};
credentials.user="8a1f2f24daf5";
credentials.password="ddf341731ca4";
credentials.host="pd1cssf63mstdo7.c11tgml1ur28.eu-central-1.rds.amazonaws.com";
credentials.database="postgres_db";
credentials.port=5432;
credentials.ssl=true;
credentials.uri="postgres://8a1f2f24daf5:ddf341731ca4@pd1cssf63mstdo7.c11tgml1ur28.eu-central-1.rds.amazonaws.com:5432/postgres_db";

credentials.oauth_token={};
credentials.oauth_token.uri="https://sdcplatformnextgencf.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials"
credentials.oauth_token.client_id="sb-43993ba7-64a0-4a5f-b668-7fdacbc12f34!b17636|ans-xsuaa!b3796"
credentials.oauth_token.client_secret="OuE4hTggVw7IoPNmL1zBKd+xFKY="
credentials.oauth_token.pwd="c2ItNDM5OTNiYTctNjRhMC00YTVmLWI2NjgtN2ZkYWNiYzEyZjM0IWIxNzYzNnxhbnMteHN1YWEhYjM3OTY6T3VFNGhUZ2dWdzdJb1BObUwxekJLZCt4RktZPQ=="

credentials.ans={}
credentials.ans.uri="https://clm-sl-ans-live-ans-service-api.cfapps.eu10.hana.ondemand.com/cf/consumer/v1/matched-events"
credentials.ans.pwd=""

const apicall = async function apicall(opts) {
                return new Promise((resolve, reject) => {
                    console.log(opts.url);
                    var options = {
                        url: opts.url,
                        headers: opts.headers,
                        method: opts.method

                    };
                    if ((options.method == "POST") || (options.method == "PUT") || (options.method == "PATCH")) {
                        options.body = opts.payload;
                    }
                    request(options, (error, response, data) => {
                        if (error) {
                            reject(error);
                            console.log("error" + error);
                        } else {
                            resolve(data);
                        };
                    })
                });
            }

module.exports = {
  credentials,
  apicall
}