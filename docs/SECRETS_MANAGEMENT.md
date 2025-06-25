# Secrets Management Guide

This guide explains how to securely manage secrets for the Barum MVP deployment.

## 🚨 **CRITICAL: Never Commit Secrets to Git**

The following files contain sensitive information and should **NEVER** be committed:
- `aws/environments/mvp.tfvars` (real secrets)
- SSH private keys (`.pem`, `.key` files)
- Environment files with real credentials

## 📋 **Required Secrets**

You need to collect these secrets before deployment:

### **Supabase Secrets** (Get from Supabase Dashboard)
1. **Project URL**: `https://your-project.supabase.co`
2. **Anon Key**: Found in Settings → API → `anon public`
3. **Service Role Key**: Found in Settings → API → `service_role secret`
4. **Database URL**: Found in Settings → Database → Connection String

### **Custom Secrets**
1. **JWT Secret**: Generate a strong random string (e.g., `openssl rand -hex 32`)
2. **SSH Key**: Your EC2 SSH public key

### **AWS Secrets**
1. **Route53 Zone ID**: From your hosted zone in Route53
2. **Domain**: Your actual domain name

## 🔧 **Setup Process**

### **Step 1: Copy Template**
```bash
cp aws/environments/mvp.tfvars.example aws/environments/mvp.tfvars
```

### **Step 2: Fill in Real Values**
Edit `aws/environments/mvp.tfvars` with your actual secrets:

```hcl
# Example - replace with your real values
supabase_url = "https://abcdef123456.supabase.co"
supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# ... etc
```

## 🏢 **GitLab CI/CD Variables (Recommended)**

For production deployments, store secrets in GitLab CI/CD variables:

### **Setup GitLab Variables**
1. Go to your GitLab project
2. Navigate to: **Settings → CI/CD → Variables**
3. Add these **masked** and **protected** variables:

```
TF_VAR_database_url
TF_VAR_jwt_secret
TF_VAR_supabase_url
TF_VAR_supabase_anon_key
TF_VAR_supabase_service_role_key
TF_VAR_next_public_supabase_url
TF_VAR_next_public_supabase_anon_key
TF_VAR_ssh_public_key
TF_VAR_route53_zone_id
```

### **Update CI/CD Pipeline**
Your `.gitlab-ci.yml` can then use these variables:

```yaml
deploy_infrastructure:
  script:
    - terraform plan -var-file=environments/mvp.tfvars
    - terraform apply -auto-approve -var-file=environments/mvp.tfvars
  variables:
    # GitLab will automatically inject TF_VAR_* variables
```

## 🔐 **Alternative: AWS Secrets Manager**

For even better security, store secrets in AWS Secrets Manager:

### **Create Secret in AWS**
```bash
aws secretsmanager create-secret \
  --name "barum/mvp/supabase" \
  --description "Supabase credentials for Barum MVP" \
  --secret-string '{
    "supabase_url": "https://your-project.supabase.co",
    "supabase_anon_key": "your-anon-key",
    "supabase_service_role_key": "your-service-role-key"
  }'
```

### **Reference in Terraform**
```hcl
data "aws_secretsmanager_secret_version" "supabase" {
  secret_id = "barum/mvp/supabase"
}

locals {
  supabase_secrets = jsondecode(data.aws_secretsmanager_secret_version.supabase.secret_string)
}
```

## 📁 **Local Development**

For local development:

1. **Keep secrets in local files** (ignored by git):
   - Use `aws/environments/mvp.tfvars` for your local values
   - This file is automatically ignored by `.gitignore`

2. **Use environment variables**:
   ```bash
   export TF_VAR_database_url="your-db-url"
   export TF_VAR_jwt_secret="your-jwt-secret"
   terraform plan -var-file=environments/mvp.tfvars
   ```

## ✅ **Security Checklist**

- [ ] `aws/environments/mvp.tfvars` is in `.gitignore`
- [ ] No real secrets in any committed files
- [ ] GitLab CI/CD variables are marked as **masked** and **protected**
- [ ] SSH private keys are stored securely (not in the repository)
- [ ] Database passwords are complex and unique
- [ ] JWT secrets are randomly generated and at least 32 characters

## 🚨 **If Secrets Were Accidentally Committed**

If you accidentally committed secrets:

1. **Immediately rotate all exposed secrets**:
   - Generate new JWT secret
   - Regenerate Supabase service role key
   - Change database password

2. **Clean git history**:
   ```bash
   # Remove from git history (dangerous - use with caution)
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch aws/environments/mvp.tfvars' \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push** (if you own the repository):
   ```bash
   git push origin --force --all
   ```

## 📞 **Need Help?**

- Check AWS documentation for Secrets Manager
- Review GitLab CI/CD variables documentation
- Contact your team's security officer for guidance 