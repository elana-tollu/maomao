import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import {Construct} from 'constructs';
import * as path from "path";

export interface ProfessionalSiteCdnStackProps extends cdk.StackProps {
    readonly mediaBucket: s3.IBucket;
    readonly storageBucket: s3.IBucket;
    readonly certificate: acm.ICertificate;
    readonly hostedZone: route53.IHostedZone;
}

export class ProfessionalSiteCdnStack extends cdk.Stack {
    public readonly distribution: cloudfront.Distribution;
    public readonly releaseStore: cloudfront.KeyValueStore;

    constructor(scope: Construct, id: string, props: ProfessionalSiteCdnStackProps) {
        super(scope, id, props);

        this.releaseStore = new cloudfront.KeyValueStore(this, 'ReleaseKeyValueStore', {
            keyValueStoreName: 'professional-site-releases',
        });

        const urlRewriteFunction = new cloudfront.Function(this, 'UrlRewriteFunction', {
            code: cloudfront.FunctionCode.fromFile({
                filePath: path.join(__dirname, '../functions/url-rewrite.js'),
            }),
            runtime: cloudfront.FunctionRuntime.JS_2_0,
            keyValueStore: this.releaseStore,
        });

        const storageBucketForOrigin = s3.Bucket.fromBucketAttributes(this, 'ImportedStorageBucket', {
            bucketArn: props.storageBucket.bucketArn,
            bucketRegionalDomainName: props.storageBucket.bucketRegionalDomainName,
        });

        const mediaBucketForOrigin = s3.Bucket.fromBucketAttributes(this, 'ImportedMediaBucket', {
            bucketArn: props.mediaBucket.bucketArn,
            bucketRegionalDomainName: props.mediaBucket.bucketRegionalDomainName,
        });

        // CloudFront Distribution
        this.distribution = new cloudfront.Distribution(this, 'ProfessionalSiteDistribution', {
            domainNames: ['elana.tolliu.pro'],
            certificate: props.certificate,
            defaultRootObject: 'index.html',
            // 1. По умолчанию раздаем статику Astro
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(storageBucketForOrigin),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                functionAssociations: [
                    {
                        function: urlRewriteFunction,
                        eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                    },
                ],
            },
            // 2. Все запросы /audio/* направляем в ваш бакет с медиа
            additionalBehaviors: {
                '/media/*': {
                    origin: origins.S3BucketOrigin.withOriginAccessControl(mediaBucketForOrigin),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                },
            },
        });

        // Направляем elana.tolliu.pro на CloudFront
        new route53.ARecord(this, 'ElanaAliasRecord', {
            zone: props.hostedZone,
            recordName: 'elana',
            target: route53.RecordTarget.fromAlias(
                new targets.CloudFrontTarget(this.distribution)
            ),
        });

        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: this.distribution.distributionDomainName,
        });

        new cdk.CfnOutput(this, 'ReleaseKvsArn', {
            value: this.releaseStore.keyValueStoreArn,
        });
    }
}