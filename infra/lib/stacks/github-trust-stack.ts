import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from "aws-cdk-lib/aws-s3";
import {Construct} from "constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

export interface GithubTrustStackProps extends cdk.StackProps {
    readonly storageBucket: s3.IBucket;
    readonly distribution: cloudfront.Distribution;
    readonly releaseStore: cloudfront.KeyValueStore;
}

export class GithubTrustStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: GithubTrustStackProps) {
        super(scope, id, props);

        // Внутри вашего стека (например, ProfessionalSiteCdnStack):

        // 1. Регистрируем GitHub как доверенный OIDC-провайдер (делается 1 раз на AWS-аккаунт)
        const githubProvider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
            url: 'https://token.actions.githubusercontent.com', clientIds: ['sts.amazonaws.com'],
        });

        // 2. Создаем роль для GitHub Actions (замените ВАШ_GITHUB_НИК/ВАШ_РЕПОЗИТОРИЙ)
        const deployRole = new iam.Role(this, 'GitHubDeployRole', {
            roleName: 'professional-site-github-deploy',
            assumedBy: new iam.WebIdentityPrincipal(githubProvider.openIdConnectProviderArn, {
                StringEquals: {
                    'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                }, StringLike: {
                    // Разрешаем деплой только из ветки main вашего репозитория
                    'token.actions.githubusercontent.com:sub': 'repo:elana-tollu/maomao:ref:refs/heads/main',
                },
            }),
        });

        // 3. Выдаем роли минимально необходимые права:
        // Запись и удаление файлов в бакете статики сайта
        props.storageBucket.grantReadWrite(deployRole);

        props.storageBucket.grantDelete(deployRole);

        props.distribution.grant(
            deployRole,
            'cloudfront:GetDistributionConfig',
            'cloudfront:UpdateDistribution',
            'cloudfront:CreateInvalidation'
        );

        deployRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    'cloudfront-keyvaluestore:DescribeKeyValueStore',
                    'cloudfront-keyvaluestore:GetKey',
                    'cloudfront-keyvaluestore:PutKey',
                    'cloudfront-keyvaluestore:DeleteKey',
                    'cloudfront-keyvaluestore:ListKeys',
                ],
                resources: [props.releaseStore.keyValueStoreArn],
            }),
        );

        // Выводим ARN роли и ID дистрибуции, чтобы добавить их в GitHub
        new cdk.CfnOutput(this,

            'GitHubDeployRoleArn', {
                value: deployRole.roleArn,
            });

        new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
            value: props.distribution.distributionId,
        });
    }
}