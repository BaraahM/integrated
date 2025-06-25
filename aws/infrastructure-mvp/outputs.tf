# MVP Infrastructure Outputs

# Networking
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

# Compute
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.main.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.main.public_ip
}

output "instance_private_ip" {
  description = "Private IP address of the EC2 instance"
  value       = aws_instance.main.private_ip
}

# Load Balancer
output "load_balancer_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.main.zone_id
}

# Security
output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}

output "ec2_security_group_id" {
  description = "ID of the EC2 security group"
  value       = aws_security_group.ec2.id
}

# IAM
output "ec2_role_arn" {
  description = "ARN of the EC2 IAM role"
  value       = aws_iam_role.ec2_role.arn
}

output "ec2_instance_profile_arn" {
  description = "ARN of the EC2 instance profile"
  value       = aws_iam_instance_profile.ec2_profile.arn
}

# ECR
output "api_ecr_repository_url" {
  description = "URL of the API ECR repository"
  value       = aws_ecr_repository.api.repository_url
}

output "web_next_ecr_repository_url" {
  description = "URL of the Web Next ECR repository"
  value       = aws_ecr_repository.web_next.repository_url
}

# S3 and CloudFront
output "s3_bucket_name" {
  description = "Name of the S3 bucket for static assets"
  value       = aws_s3_bucket.static_assets.bucket
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.static_assets.id
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.static_assets.arn
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.static_assets.domain_name
}

# Secrets
output "secrets_manager_secret_arn" {
  description = "ARN of the Secrets Manager secret"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

# DNS
output "domain_name" {
  description = "Domain name configured for the application"
  value       = var.domain_name
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.main.arn
}

# CloudWatch
output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.app.name
}

output "log_group_arn" {
  description = "ARN of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.app.arn
}

# Deployment Information
output "ssh_connection_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/barum-mvp-key.pem ec2-user@${aws_instance.main.public_ip}"
}

# Docker Commands
output "docker_login_command" {
  description = "AWS CLI command to login to ECR"
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

# Estimated Monthly Costs
output "estimated_monthly_costs" {
  description = "Estimated monthly costs breakdown"
  value = {
    "Total" = "$44.58"
    "EC2_t3_small" = "$15.18"
    "ALB" = "$22.50"
    "Route53_Hosted_Zone" = "$0.50"
    "CloudWatch_Logs" = "$0.50"
    "ECR_Storage" = "$1.00"
    "S3_CloudFront" = "$3.00"
    "Secrets_Manager" = "$0.40"
    "Data_Transfer" = "$1.50"
    "Note" = "Costs may vary based on actual usage and region"
  }
}

# Deployment URLs
output "application_urls" {
  description = "Application URLs after deployment"
  value = {
    "Main_Website" = "https://${var.subdomain}.${var.domain_name}"
    "API_Endpoint" = "https://${var.subdomain}.${var.domain_name}/api"
    "Health_Check_API" = "https://${var.subdomain}.${var.domain_name}/api/health"
    "Health_Check_Web" = "https://${var.subdomain}.${var.domain_name}/health"
  }
}

# Next Steps
output "next_steps" {
  description = "Next steps after infrastructure deployment"
  value = [
    "1. Update your domain's nameservers to point to Route 53 (if not already done)",
    "2. Wait for SSL certificate validation (usually 5-10 minutes)",
    "3. Update GitLab CI/CD variables with the output values",
    "4. Run your first deployment pipeline",
    "5. Verify application is accessible at https://${var.subdomain}.${var.domain_name}",
    "6. Set up monitoring and alerts in CloudWatch",
    "7. Configure automated backups if needed"
  ]
} 