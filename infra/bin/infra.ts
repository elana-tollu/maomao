#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ElanaDnsStack } from '../lib/stacks/elana-dns-stack';
import { ProfessionalSiteMediaStack } from '../lib/stacks/professional-site-media-stack';
import { ProfessionalSiteStorageStack } from "../lib/stacks/professional-site-storage-stack";
import { ProfessionalSiteCdnStack } from "../lib/stacks/professional-site-cdn-stack";
import {GithubTrustStack} from "../lib/stacks/github-trust-stack";

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const mainRegion = process.env.CDK_DEFAULT_REGION || 'eu-north-1';

const dnsStack = new ElanaDnsStack(app, 'ElanaDnsStack', {
    env: { account, region: 'us-east-1' },
    crossRegionReferences: true,
});

const storageStack = new ProfessionalSiteStorageStack(app, 'ProfessionalSiteStorageStack', {
    env: { account, region: mainRegion },
    crossRegionReferences: true,
});

const mediaStack = new ProfessionalSiteMediaStack(app, 'ProfessionalSiteMediaStack', {
    env: { account, region: mainRegion },
    crossRegionReferences: true,
})

const cdnStack = new ProfessionalSiteCdnStack(app, 'ProfessionalSiteCdnStack', {
    env: { account, region: mainRegion },
    crossRegionReferences: true,
    mediaBucket: mediaStack.mediaBucket,
    storageBucket: storageStack.storageBucket,
    certificate: dnsStack.certificate,
    hostedZone: dnsStack.hostedZone,
});

const trustStack = new GithubTrustStack(app, 'GithubTrustStack', {
    env: { account, region: mainRegion },
    crossRegionReferences: true,
    storageBucket: storageStack.storageBucket,
    distribution: cdnStack.distribution,
    releaseStore: cdnStack.releaseStore,
});
