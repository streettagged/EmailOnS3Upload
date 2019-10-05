const aws = require('aws-sdk');
const ses = new aws.SES();
const s3 = new aws.S3({
    apiVersion: '2006-03-01'
});


exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const s3params = {
        Bucket: bucket,
        Key: key,
    };
    
    //console.log(s3params)
    
    var params = {
        Destination: {
            ToAddresses: [
                process.env.TO_EMAIL,
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: "New Art:<br> <img src=" + process.env.CDN + s3params.Key + "><br><br>" +
                    "<a href=https://streettagged.com/approve/" + s3params.Key + ">Approve</a><br><br>" +
                    "<a href=https://streettagged.com/deny/" + s3params.Key + ">Deny</a>"
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "New Street Art Needs Moderation"
            }
        },
        Source: process.env.FROM_EMAIL,
        /* required */

    };

    //console.log(params.Message.Body)

    ses.sendEmail(params, function (err, data) {
        callback(null, {
            err: err,
            data: data
        });
        if (err) {
            console.log(err);
            context.fail(err);
        } else {

            console.log(data);
            context.succeed(event);
        }
    });
};