import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export class ElanaDnsStack extends cdk.Stack {
    public readonly hostedZone: route53.IHostedZone;
    public readonly certificate: acm.Certificate;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Ищем существующую зону tolliu.pro в Route 53
        this.hostedZone = route53.HostedZone.fromLookup(this, 'TolliuZone', {
            domainName: 'tolliu.pro',
        });

        // Выпускаем сертификат с автоматической DNS-валидацией
        this.certificate = new acm.Certificate(this, 'ElanaCert', {
            domainName: 'elana.tolliu.pro',
            validation: acm.CertificateValidation.fromDns(this.hostedZone),
        });

        new cdk.CfnOutput(this, 'ElanaCertificateArn', {
            value: this.certificate.certificateArn,
        });
    }
}