# ECS Module Outputs

# Cluster
output "cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.main.id
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

# API Service
output "api_service_id" {
  description = "ID of the API service"
  value       = aws_ecs_service.api.id
}

output "api_service_name" {
  description = "Name of the API service"
  value       = aws_ecs_service.api.name
}

output "api_service_arn" {
  description = "ARN of the API service"
  value       = aws_ecs_service.api.id
}

# Web Next Service
output "web_next_service_id" {
  description = "ID of the Web Next service"
  value       = aws_ecs_service.web_next.id
}

output "web_next_service_name" {
  description = "Name of the Web Next service"
  value       = aws_ecs_service.web_next.name
}

output "web_next_service_arn" {
  description = "ARN of the Web Next service"
  value       = aws_ecs_service.web_next.id
}

# Task Definitions
output "api_task_definition_arn" {
  description = "ARN of the API task definition"
  value       = aws_ecs_task_definition.api.arn
}

output "api_task_definition_family" {
  description = "Family of the API task definition"
  value       = aws_ecs_task_definition.api.family
}

output "web_next_task_definition_arn" {
  description = "ARN of the Web Next task definition"
  value       = aws_ecs_task_definition.web_next.arn
}

output "web_next_task_definition_family" {
  description = "Family of the Web Next task definition"
  value       = aws_ecs_task_definition.web_next.family
}

# Load Balancers
output "api_load_balancer_id" {
  description = "ID of the API load balancer"
  value       = aws_lb.api.id
}

output "api_load_balancer_arn" {
  description = "ARN of the API load balancer"
  value       = aws_lb.api.arn
}

output "api_load_balancer_dns" {
  description = "DNS name of the API load balancer"
  value       = aws_lb.api.dns_name
}

output "api_load_balancer_zone_id" {
  description = "Zone ID of the API load balancer"
  value       = aws_lb.api.zone_id
}

output "web_next_load_balancer_id" {
  description = "ID of the Web Next load balancer"
  value       = aws_lb.web_next.id
}

output "web_next_load_balancer_arn" {
  description = "ARN of the Web Next load balancer"
  value       = aws_lb.web_next.arn
}

output "web_next_load_balancer_dns" {
  description = "DNS name of the Web Next load balancer"
  value       = aws_lb.web_next.dns_name
}

output "web_next_load_balancer_zone_id" {
  description = "Zone ID of the Web Next load balancer"
  value       = aws_lb.web_next.zone_id
}

# Target Groups
output "api_target_group_arn" {
  description = "ARN of the API target group"
  value       = aws_lb_target_group.api.arn
}

output "web_next_target_group_arn" {
  description = "ARN of the Web Next target group"
  value       = aws_lb_target_group.web_next.arn
}

# IAM Roles
output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

# Auto Scaling
output "api_autoscaling_target_resource_id" {
  description = "Resource ID of the API autoscaling target"
  value       = aws_appautoscaling_target.api.resource_id
}

output "web_next_autoscaling_target_resource_id" {
  description = "Resource ID of the Web Next autoscaling target"
  value       = aws_appautoscaling_target.web_next.resource_id
} 