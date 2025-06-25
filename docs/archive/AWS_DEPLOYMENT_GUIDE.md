# AWS Deployment Guide

This guide walks you through deploying your Barum application to AWS using ECS Fargate, S3, CloudFront, and GitLab CI/CD.

## Prerequisites

### Required Tools
- AWS CLI v2
- Terraform >= 1.5.0
- GitLab account with CI/CD enabled
- Domain name (optional but recommended)

### AWS Account Setup
1. Create an AWS account if you don't have one
2. Create an IAM user for deployments with programmatic access
3. Attach the following policies to the user:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonECS_FullAccess`
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `AmazonRoute53FullAccess`
   - `AWSCertificateManagerFullAccess`
   - `SecretsManagerReadWrite`
   - `CloudWatchLogsFullAccess`
   - `IAMFullAccess`
   - `AmazonVPCFullAccess`

## Step 1: Terraform State Bucket Setup

Create an S3 bucket for Terraform state:

```bash
# Replace with your unique bucket name
TERRAFORM_STATE_BUCKET="your-company-terraform-state"
AWS_REGION="us-east-1"

# Create the bucket
aws s3 mb s3://$TERRAFORM_STATE_BUCKET --region $AWS_REGION

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket $TERRAFORM_STATE_BUCKET \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket $TERRAFORM_STATE_BUCKET \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'
```

## Step 2: Configure Environment Variables

### Update Environment Files

1. **Development Environment** (`aws/environments/dev.tfvars`):
   - Replace `yourdomain.com` with your actual domain
   - Update Supabase configuration with your dev project details
   - Generate strong JWT secrets using: `openssl rand -hex 32`

2. **Production Environment** (`aws/environments/prod.tfvars`):
   - Replace `yourdomain.com` with your actual domain
   - Update Supabase configuration with your prod project details
   - Use strong, unique secrets for production

### Example Secret Generation

```bash
# Generate JWT secrets
echo "JWT_ACCESS_SECRET=$(openssl rand -hex 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)"
echo "JWT_RESET_PASSWORD_SECRET=$(openssl rand -hex 32)"
echo "JWT_INVITE_USER_SECRET=$(openssl rand -hex 32)"
```

## Step 3: GitLab CI/CD Variables

In your GitLab project, go to Settings > CI/CD > Variables and add:

### AWS Configuration
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key (masked)
- `AWS_ACCOUNT_ID`: Your AWS account ID
- `TERRAFORM_STATE_BUCKET`: Your Terraform state bucket name

### Development Environment
- `DEV_CLIENT_BUCKET`: Will be output from Terraform
- `DEV_WEBSITE_BUCKET`: Will be output from Terraform
- `DEV_CLOUDFRONT_DISTRIBUTION_ID`: Will be output from Terraform
- `DEV_ECS_CLUSTER`: Will be output from Terraform
- `DEV_API_SERVICE`: Will be output from Terraform
- `DEV_API_TASK_DEFINITION`: Will be output from Terraform
- `DEV_API_URL`: Your dev API URL

### Production Environment
- `PROD_CLIENT_BUCKET`: Will be output from Terraform
- `PROD_WEBSITE_BUCKET`: Will be output from Terraform
- `PROD_CLOUDFRONT_DISTRIBUTION_ID`: Will be output from Terraform
- `PROD_ECS_CLUSTER`: Will be output from Terraform
- `PROD_API_SERVICE`: Will be output from Terraform
- `PROD_API_TASK_DEFINITION`: Will be output from Terraform
- `PROD_WEB_NEXT_SERVICE`: Will be output from Terraform
- `PROD_WEB_NEXT_TASK_DEFINITION`: Will be output from Terraform
- `PROD_API_URL`: Your prod API URL

### Frontend Build Variables
- `VITE_API_URL`: Your API URL for client builds
- `VITE_SUPABASE_URL`: Your Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `NEXT_PUBLIC_API_URL`: Your API URL for Next.js builds
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## Step 4: Initial Infrastructure Deployment

### Deploy Development Environment

1. Create the missing Terraform modules first (see Module Creation section below)

2. Deploy development infrastructure:

```bash
cd aws/infrastructure

# Initialize Terraform
terraform init -backend-config="bucket=$TERRAFORM_STATE_BUCKET" \
               -backend-config="key=dev/terraform.tfstate" \
               -backend-config="region=us-east-1"

# Plan the deployment
terraform plan -var-file="../environments/dev.tfvars"

# Apply the deployment
terraform apply -var-file="../environments/dev.tfvars"
```

3. Note the outputs - you'll need these for GitLab CI/CD variables

### Deploy Production Environment

```bash
# Initialize Terraform for production
terraform init -backend-config="bucket=$TERRAFORM_STATE_BUCKET" \
               -backend-config="key=prod/terraform.tfstate" \
               -backend-config="region=us-east-1"

# Plan the deployment
terraform plan -var-file="../environments/prod.tfvars"

# Apply the deployment
terraform apply -var-file="../environments/prod.tfvars"
```

## Step 5: DNS Configuration

If you're managing DNS with Route 53:

1. Update your domain registrar's nameservers to use the Route 53 nameservers (found in Terraform outputs)
2. Wait for DNS propagation (can take up to 48 hours)

If you're managing DNS externally:

1. Create CNAME records pointing to the CloudFront distributions
2. Create CNAME records for the API pointing to the load balancer DNS names

## Step 6: SSL Certificate Validation

The SSL certificates will be automatically validated if you're using Route 53. If using external DNS:

1. Add the DNS validation records to your DNS provider
2. Wait for certificate validation

## Step 7: Application Health Endpoints

Ensure your applications have health endpoints:

### API Health Endpoint

Add to your NestJS API (`packages/api/src/app.controller.ts`):

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV 
    };
  }
}
```

### Next.js Health Endpoint

Add to your Next.js app (`packages/web-next/pages/api/health.ts`):

```typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
}
```

## Step 8: Deploy with GitLab CI/CD

1. Push your code to the appropriate branch:
   - `develop` branch triggers development deployment
   - `main` branch triggers production deployment

2. Monitor the GitLab CI/CD pipeline

3. Manual deployment triggers are enabled for safety

## Step 9: Monitoring and Logging

### CloudWatch Logs

Access logs in the AWS CloudWatch console:
- API logs: `/ecs/barum-{env}-api`
- Web Next logs: `/ecs/barum-{env}-web-next`

### Container Insights

ECS Container Insights is enabled for monitoring:
- CPU and memory utilization
- Network metrics
- Service health

### Application Monitoring

If using Langfuse for AI observability:
1. Create a Langfuse account
2. Add your public and secret keys to the environment variables
3. Monitor AI/ML operations in the Langfuse dashboard

## Troubleshooting

### Common Issues

1. **Certificate validation fails**:
   - Check DNS records are correctly set
   - Verify domain ownership
   - Wait for DNS propagation

2. **ECS tasks failing to start**:
   - Check CloudWatch logs for errors
   - Verify Secrets Manager permissions
   - Ensure health endpoints are working

3. **Load balancer health checks failing**:
   - Verify security groups allow traffic
   - Check application health endpoints
   - Review target group configuration

4. **Static assets not loading**:
   - Check S3 bucket permissions
   - Verify CloudFront distribution status
   - Check CORS configuration

### Debugging Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster barum-prod-cluster --services barum-prod-api-service

# View ECS task logs
aws logs tail /ecs/barum-prod-api --follow

# Check certificate status
aws acm describe-certificate --certificate-arn <certificate-arn>

# Test health endpoints
curl https://api.yourdomain.com/health
curl https://your-next-app.yourdomain.com/api/health
```

## Security Best Practices

1. **Secrets Management**:
   - Use AWS Secrets Manager for all sensitive data
   - Rotate secrets regularly
   - Never commit secrets to version control

2. **Network Security**:
   - ECS tasks run in private subnets
   - Security groups follow least privilege principle
   - HTTPS enforced everywhere

3. **Access Control**:
   - IAM roles follow least privilege
   - Separate environments have separate AWS accounts (recommended)
   - Enable AWS CloudTrail for audit logging

4. **Container Security**:
   - Images are scanned for vulnerabilities
   - Containers run as non-root users
   - Resource limits are enforced

## Scaling Considerations

### Auto Scaling

The deployment includes auto-scaling based on:
- CPU utilization (target: 70%)
- Memory utilization (target: 80%)

### Manual Scaling

To adjust scaling parameters:

1. Update the `.tfvars` files
2. Run `terraform apply`
3. ECS will gradually scale to new desired capacity

### Cost Optimization

1. **Development Environment**:
   - Use smaller instance sizes
   - Reduce log retention periods
   - Consider scheduled scaling down during off-hours

2. **Production Environment**:
   - Monitor CloudWatch metrics
   - Use Reserved Instances for predictable workloads
   - Implement CloudWatch alarms for cost monitoring

## Backup and Disaster Recovery

### Data Backup

Since you're using Supabase:
- Database backups are handled by Supabase
- Set up regular exports if needed
- Consider point-in-time recovery options

### Infrastructure Backup

- Terraform state is versioned in S3
- Infrastructure can be recreated from code
- Container images are versioned in ECR

### Disaster Recovery Plan

1. Infrastructure recreation: ~15-30 minutes
2. Application deployment: ~10-15 minutes
3. DNS propagation: Up to 48 hours
4. Total RTO: 1-2 hours (excluding DNS)

## Module Creation

You need to create the remaining Terraform modules. Here's what you need:

### Required Modules

1. `aws/infrastructure/modules/networking/` - VPC, subnets, NAT gateways
2. `aws/infrastructure/modules/security/` - Security groups and IAM roles
3. `aws/infrastructure/modules/s3-cloudfront/` - Static hosting setup
4. `aws/infrastructure/modules/ecs/variables.tf` - ECS module variables
5. `aws/infrastructure/modules/ecs/outputs.tf` - ECS module outputs

These modules are referenced in the main Terraform configuration but need to be created. Would you like me to generate these modules for you? 