# MVP Infrastructure Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "barum"
}

variable "environment" {
  description = "Environment name (e.g., mvp, dev, prod)"
  type        = string
  default     = "mvp"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "region" {
  description = "Alias for aws_region (for compatibility)"
  type        = string
  default     = "ap-southeast-1"
}

# Networking
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

# Compute
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
  validation {
    condition = contains([
      "t3.micro", "t3.small", "t3.medium", "t3.large",
      "t3.xlarge", "t3.2xlarge"
    ], var.instance_type)
    error_message = "Instance type must be a valid t3 instance type."
  }
}

variable "key_name" {
  description = "AWS Key Pair name for EC2 instances"
  type        = string
  default     = ""
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
  sensitive   = true
}

# Domain and SSL
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "subdomain" {
  description = "Subdomain for the application"
  type        = string
  default     = "app"
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  type        = string
}

# Security
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Application Environment Variables
variable "database_url_encoded" {
  description = "Database connection URL (base64 encoded)"
  type        = string
  sensitive   = true
}

# Decode the database URL
locals {
  database_url = base64decode(var.database_url_encoded)
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

variable "next_public_supabase_url" {
  description = "Public Supabase URL for frontend"
  type        = string
}

variable "next_public_supabase_anon_key" {
  description = "Public Supabase anonymous key for frontend"
  type        = string
}

variable "next_public_api_url" {
  description = "Public API URL for frontend"
  type        = string
}

# Tags
variable "default_tags" {
  description = "Default tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "barum"
    Environment = "mvp"
    Owner       = "team"
    ManagedBy   = "terraform"
  }
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
} 