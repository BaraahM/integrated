# ECS Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

# Networking
variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs of the private subnets"
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "IDs of the public subnets"
  type        = list(string)
}

# Security Groups
variable "ecs_security_group_id" {
  description = "ID of the ECS security group"
  type        = string
}

variable "alb_security_group_id" {
  description = "ID of the ALB security group"
  type        = string
}

# ECR
variable "api_ecr_repository_url" {
  description = "URL of the API ECR repository"
  type        = string
}

variable "web_next_ecr_repository_url" {
  description = "URL of the Web Next ECR repository"
  type        = string
}

# API Configuration
variable "api_cpu" {
  description = "CPU units for API container"
  type        = number
}

variable "api_memory" {
  description = "Memory for API container (in MB)"
  type        = number
}

variable "api_desired_count" {
  description = "Desired number of API tasks"
  type        = number
}

variable "api_min_capacity" {
  description = "Minimum number of API tasks"
  type        = number
}

variable "api_max_capacity" {
  description = "Maximum number of API tasks"
  type        = number
}

# Web Next Configuration
variable "web_next_cpu" {
  description = "CPU units for Web Next container"
  type        = number
}

variable "web_next_memory" {
  description = "Memory for Web Next container (in MB)"
  type        = number
}

variable "web_next_desired_count" {
  description = "Desired number of Web Next tasks"
  type        = number
}

variable "web_next_min_capacity" {
  description = "Minimum number of Web Next tasks"
  type        = number
}

variable "web_next_max_capacity" {
  description = "Maximum number of Web Next tasks"
  type        = number
}

# Environment Variables
variable "api_environment_variables" {
  description = "Environment variables for API container"
  type        = map(string)
  default     = {}
}

variable "web_next_environment_variables" {
  description = "Environment variables for Web Next container"
  type        = map(string)
  default     = {}
}

# Secrets
variable "api_secrets_arn" {
  description = "ARN of the API secrets in Secrets Manager"
  type        = string
}

variable "web_next_secrets_arn" {
  description = "ARN of the Web Next secrets in Secrets Manager"
  type        = string
}

# Domain Configuration
variable "domain_name" {
  description = "Primary domain name"
  type        = string
}

variable "api_domain_name" {
  description = "API domain name"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate"
  type        = string
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
} 