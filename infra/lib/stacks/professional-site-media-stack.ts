import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as iam from "aws-cdk-lib/aws-iam";

export class ProfessionalSiteMediaStack extends cdk.Stack {
    public readonly mediaBucket: s3.Bucket;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.mediaBucket = new s3.Bucket(this, 'ProfessionalSiteMediaBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });

        this.mediaBucket.addToResourcePolicy(
            new iam.PolicyStatement({
                sid: 'AllowCloudFrontServicePrincipalReadOnly',
                effect: iam.Effect.ALLOW,
                actions: ['s3:GetObject'],
                resources: [this.mediaBucket.arnForObjects('*')],
                principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
                conditions: {
                    StringEquals: {
                        'AWS:SourceAccount': this.account,
                    },
                },
            }),
        );

        new cdk.CfnOutput(this, 'MediaBucketName', {
            value: this.mediaBucket.bucketName,
        });
    }
}