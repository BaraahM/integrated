# AWS IAM Permissions for Barum MVP Deployment

This document explains the AWS permissions needed for deploying your Barum MVP.

## 🎯 Quick Setup Options

### Option 1: Use AWS Managed Policies (Easiest)
For quick setup, attach these AWS managed policies to your user/role:

```bash
# Attach these policies to your AWS user or role
AmazonEC2FullAccess
AmazonRDSFullAccess
AmazonElasticContainerRegistryFullAccess
CloudWatchLogsFullAccess
AmazonRoute53FullAccess
ElasticLoadBalancingFullAccess
IAMFullAccess
```

**Pros:** Quick to set up, covers everything
**Cons:** Broader permissions than needed (security concern)

### Option 2: Custom Policy (Recommended)
Use the custom policy in `mvp-deployment-policy.json` for minimal required permissions.

**Pros:** Principle of least privilege, more secure
**Cons:** Requires more setup

## 🔐 Setting Up IAM Permissions

### Method 1: Create IAM User (Recommended for MVP)

1. **Create IAM User:**
   ```bash
   # Via AWS CLI
   aws iam create-user --user-name barum-deployment-user
   ```

2. **Attach Policy:**
   ```bash
   # Option A: Use managed policies (easier)
   aws iam attach-user-policy --user-name barum-deployment-user --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
   aws iam attach-user-policy --user-name barum-deployment-user --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess
   aws iam attach-user-policy --user-name barum-deployment-user --policy-arn arn:aws:iam::aws:policy/AmazonElasticContainerRegistryFullAccess
   aws iam attach-user-policy --user-name barum-deployment-user --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
   aws iam attach-user-policy --user-name barum-deployment-user --policy-arn arn:aws:iam::aws:policy/AmazonRoute53FullAccess
   aws iam attach-user-policy --user-name barum-deployment-user --policy-arn arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess
   aws iam attach-user-policy --user-name barum-deployment-user --policy-arn arn:aws:iam::aws:policy/IAMFullAccess

   # Option B: Use custom policy (more secure)
   aws iam create-policy --policy-name BarumMVPDeploymentPolicy --policy-document file://mvp-deployment-policy.json
   aws iam attach-user-policy --user-name barum-deployment-user --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/BarumMVPDeploymentPolicy
   ```

3. **Create Access Keys:**
   ```bash
   aws iam create-access-key --user-name barum-deployment-user
   ```

4. **Configure AWS CLI:**
   ```bash
   aws configure
   # Enter the Access Key ID and Secret Access Key from step 3
   ```

### Method 2: Use IAM Role (For Production)

1. **Create IAM Role:**
   ```bash
   aws iam create-role --role-name BarumDeploymentRole --assume-role-policy-document '{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {"AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_USERNAME"},
         "Action": "sts:AssumeRole"
       }
     ]
   }'
   ```

2. **Attach Policies to Role:**
   ```bash
   aws iam attach-role-policy --role-name BarumDeploymentRole --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/BarumMVPDeploymentPolicy
   ```

3. **Assume Role:**
   ```bash
   aws sts assume-role --role-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/BarumDeploymentRole --role-session-name deployment-session
   ```

## 🔍 What Each Permission Does

### EC2 Permissions
- **Purpose:** Create and manage virtual servers
- **Resources:** EC2 instances, security groups, key pairs
- **Why needed:** Your application runs on EC2 instances

### RDS Permissions  
- **Purpose:** Create and manage PostgreSQL database
- **Resources:** DB instances, subnet groups, parameter groups
- **Why needed:** Your application needs a database

### ECR Permissions
- **Purpose:** Store and manage Docker images
- **Resources:** Container registries, images
- **Why needed:** Your application is deployed as Docker containers

### Load Balancer Permissions
- **Purpose:** Distribute traffic and provide high availability
- **Resources:** Application Load Balancers, target groups
- **Why needed:** Professional deployment with load balancing

### Route 53 Permissions
- **Purpose:** DNS management for your domain
- **Resources:** Hosted zones, DNS records
- **Why needed:** Custom domain for your application

### CloudWatch Permissions
- **Purpose:** Logging and monitoring
- **Resources:** Log groups, metrics
- **Why needed:** Monitor application health and debug issues

### IAM Permissions
- **Purpose:** Create roles for EC2 instances
- **Resources:** Roles, policies, instance profiles
- **Why needed:** EC2 instances need permissions to access other AWS services

## 🚨 Security Considerations

### For MVP/Development:
- ✅ Use IAM user with programmatic access
- ✅ Use managed policies for simplicity
- ✅ Enable MFA on your AWS account
- ✅ Regularly rotate access keys

### For Production:
- ✅ Use IAM roles instead of users
- ✅ Use custom policies with minimal permissions
- ✅ Enable CloudTrail for audit logging
- ✅ Use temporary credentials when possible

## 🧪 Testing Your Permissions

After setting up permissions, test them:

```bash
# Test basic AWS access
aws sts get-caller-identity

# Test EC2 access
aws ec2 describe-instances --region us-east-1

# Test ECR access
aws ecr describe-repositories --region us-east-1

# Test RDS access
aws rds describe-db-instances --region us-east-1
```

## 📋 IAM Setup Checklist

- [ ] AWS account has necessary service limits (EC2, RDS, etc.)
- [ ] IAM user/role created
- [ ] Appropriate policies attached
- [ ] Access keys generated (for user) or role configured
- [ ] AWS CLI configured with credentials
- [ ] Permissions tested
- [ ] MFA enabled on AWS account (recommended)
- [ ] Billing alerts configured (recommended)

## 🆘 Troubleshooting Common Permission Issues

### "Access Denied" Errors:
```bash
# Check your current identity
aws sts get-caller-identity

# Check attached policies
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

### Resource Limits:
- Check AWS service quotas in your region
- Request quota increases if needed

### Region Issues:
- Ensure you're working in the correct AWS region (us-east-1 by default)
- Some services have region-specific limitations

## 💡 Pro Tips

1. **Start Broad, Then Narrow:** Begin with managed policies, then create custom policies as you understand your exact needs.

2. **Use AWS CloudShell:** If you're having trouble with local AWS CLI setup, use AWS CloudShell in the browser.

3. **Enable CloudTrail:** This helps debug permission issues by showing exactly what API calls are being made.

4. **Test in Stages:** Set up permissions, then test each service individually before running the full deployment.

---

## Next Steps

Once your IAM permissions are set up:
1. Test the permissions with the commands above
2. Proceed with the deployment using the `MVP_DEPLOYMENT_CHECKLIST.md`
3. Monitor the first deployment closely for any permission issues 