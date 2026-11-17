import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class ProfessionalSiteStorageStack extends cdk.Stack {
    public readonly storageBucket: s3.Bucket;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.storageBucket = new s3.Bucket(this, 'ProfessionalSiteStorageBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        this.storageBucket.addToResourcePolicy(
            new iam.PolicyStatement({
                sid: 'AllowCloudFrontServicePrincipalReadOnly',
                effect: iam.Effect.ALLOW,
                actions: ['s3:GetObject'],
                resources: [this.storageBucket.arnForObjects('*')],
                principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
                conditions: {
                    StringEquals: {
                        'AWS:SourceAccount': this.account,
                    },
                },
            }),
        );

        new cdk.CfnOutput(this, 'StorageBucketName', {
            value: this.storageBucket.bucketName,
        });
    }
}
