# Infrastructure Outputs

# Domain and URL outputs
output "domain_name" {
  description = "Primary domain name"
  value       = var.domain_name
}

output "api_domain_name" {
  description = "API domain name"
  value       = var.api_domain_name
}

output "client_url" {
  description = "Client application URL"
  value       = "https://${var.domain_name}"
}

output "api_url" {
  description = "API URL"
  value       = "https://${var.api_domain_name}"
}

# Infrastructure outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.networking.private_subnet_ids
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.networking.public_subnet_ids
}

# ECS outputs
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "api_service_name" {
  description = "API service name"
  value       = module.ecs.api_service_name
}

output "web_next_service_name" {
  description = "Web Next service name"
  value       = module.ecs.web_next_service_name
}

output "api_task_definition_arn" {
  description = "API task definition ARN"
  value       = module.ecs.api_task_definition_arn
}

output "web_next_task_definition_arn" {
  description = "Web Next task definition ARN"
  value       = module.ecs.web_next_task_definition_arn
}

# Load Balancer outputs
output "api_load_balancer_dns" {
  description = "API load balancer DNS name"
  value       = module.ecs.api_load_balancer_dns
}

output "web_next_load_balancer_dns" {
  description = "Web Next load balancer DNS name"
  value       = module.ecs.web_next_load_balancer_dns
}

# ECR outputs
output "api_ecr_repository_url" {
  description = "API ECR repository URL"
  value       = aws_ecr_repository.api.repository_url
}

output "web_next_ecr_repository_url" {
  description = "Web Next ECR repository URL"
  value       = aws_ecr_repository.web_next.repository_url
}

# S3 and CloudFront outputs
output "client_bucket_name" {
  description = "Client S3 bucket name"
  value       = module.s3_cloudfront.client_bucket_name
}

output "website_bucket_name" {
  description = "Website S3 bucket name"
  value       = module.s3_cloudfront.website_bucket_name
}

output "client_cloudfront_distribution_id" {
  description = "Client CloudFront distribution ID"
  value       = module.s3_cloudfront.client_cloudfront_distribution_id
}

output "website_cloudfront_distribution_id" {
  description = "Website CloudFront distribution ID"
  value       = module.s3_cloudfront.website_cloudfront_distribution_id
}

output "client_cloudfront_domain" {
  description = "Client CloudFront domain"
  value       = module.s3_cloudfront.client_cloudfront_domain
}

output "website_cloudfront_domain" {
  description = "Website CloudFront domain"
  value       = module.s3_cloudfront.website_cloudfront_domain
}

# Certificate outputs
output "certificate_arn" {
  description = "SSL certificate ARN"
  value       = aws_acm_certificate.main.arn
}

# Route 53 outputs
output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = var.manage_dns ? aws_route53_zone.main[0].zone_id : "Not managed"
}

output "route53_name_servers" {
  description = "Route 53 name servers"
  value       = var.manage_dns ? aws_route53_zone.main[0].name_servers : []
}

# Secrets Manager outputs
output "api_secrets_arn" {
  description = "API secrets ARN in Secrets Manager"
  value       = aws_secretsmanager_secret.api_secrets.arn
  sensitive   = true
}

output "web_next_secrets_arn" {
  description = "Web Next secrets ARN in Secrets Manager"
  value       = aws_secretsmanager_secret.web_next_secrets.arn
  sensitive   = true
}

# CloudWatch outputs
output "api_log_group_name" {
  description = "API CloudWatch log group name"
  value       = aws_cloudwatch_log_group.api.name
}

output "web_next_log_group_name" {
  description = "Web Next CloudWatch log group name"
  value       = aws_cloudwatch_log_group.web_next.name
}

# Environment information
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "aws_account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
} 