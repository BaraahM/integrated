# ECS Module - Container orchestration with Fargate

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"
  
  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      
      log_configuration {
        cloud_watch_encryption_enabled = false
        cloud_watch_log_group_name     = aws_cloudwatch_log_group.ecs_exec.name
      }
    }
  }
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = var.tags
}

# CloudWatch log group for ECS Exec
resource "aws_cloudwatch_log_group" "ecs_exec" {
  name              = "/aws/ecs/${local.name_prefix}-exec"
  retention_in_days = 7
  
  tags = var.tags
}

# Application Load Balancer for API
resource "aws_lb" "api" {
  name               = "${local.name_prefix}-api-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids
  
  enable_deletion_protection = false
  
  tags = var.tags
}

# Application Load Balancer for Web Next
resource "aws_lb" "web_next" {
  name               = "${local.name_prefix}-web-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids
  
  enable_deletion_protection = false
  
  tags = var.tags
}

# Target Groups
resource "aws_lb_target_group" "api" {
  name        = "${local.name_prefix}-api-tg"
  port        = 4000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 30
    interval            = 60
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }
  
  tags = var.tags
}

resource "aws_lb_target_group" "web_next" {
  name        = "${local.name_prefix}-web-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 30
    interval            = 60
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }
  
  tags = var.tags
}

# Load Balancer Listeners
resource "aws_lb_listener" "api_https" {
  load_balancer_arn = aws_lb.api.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.certificate_arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_lb_listener" "api_http" {
  load_balancer_arn = aws_lb.api.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "web_next_https" {
  load_balancer_arn = aws_lb.web_next.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.certificate_arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web_next.arn
  }
}

resource "aws_lb_listener" "web_next_http" {
  load_balancer_arn = aws_lb.web_next.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# IAM Role for ECS Tasks
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${local.name_prefix}-ecs-task-execution-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role for ECS Tasks (runtime)
resource "aws_iam_role" "ecs_task_role" {
  name = "${local.name_prefix}-ecs-task-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

# IAM Policy for Secrets Manager access
resource "aws_iam_role_policy" "ecs_secrets_policy" {
  name = "${local.name_prefix}-ecs-secrets-policy"
  role = aws_iam_role.ecs_task_execution_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          var.api_secrets_arn,
          var.web_next_secrets_arn
        ]
      }
    ]
  })
}

# Task Definition for API
resource "aws_ecs_task_definition" "api" {
  family                   = "${local.name_prefix}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn
  
  container_definitions = jsonencode([
    {
      name  = "api"
      image = "${var.api_ecr_repository_url}:latest"
      
      essential = true
      
      portMappings = [
        {
          containerPort = 4000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        for key, value in var.api_environment_variables : {
          name  = key
          value = value
        }
      ]
      
      secrets = [
        {
          name      = "SUPABASE_URL"
          valueFrom = "${var.api_secrets_arn}:SUPABASE_URL::"
        },
        {
          name      = "SUPABASE_ANON_KEY"
          valueFrom = "${var.api_secrets_arn}:SUPABASE_ANON_KEY::"
        },
        {
          name      = "SUPABASE_SERVICE_KEY"
          valueFrom = "${var.api_secrets_arn}:SUPABASE_SERVICE_KEY::"
        },
        {
          name      = "SUPABASE_JWT_SECRET"
          valueFrom = "${var.api_secrets_arn}:SUPABASE_JWT_SECRET::"
        },
        {
          name      = "DATABASE_URL"
          valueFrom = "${var.api_secrets_arn}:DATABASE_URL::"
        },
        {
          name      = "DIRECT_URL"
          valueFrom = "${var.api_secrets_arn}:DIRECT_URL::"
        },
        {
          name      = "JWT_ACCESS_SECRET"
          valueFrom = "${var.api_secrets_arn}:JWT_ACCESS_SECRET::"
        },
        {
          name      = "JWT_REFRESH_SECRET"
          valueFrom = "${var.api_secrets_arn}:JWT_REFRESH_SECRET::"
        },
        {
          name      = "JWT_RESET_PASSWORD_SECRET"
          valueFrom = "${var.api_secrets_arn}:JWT_RESET_PASSWORD_SECRET::"
        },
        {
          name      = "JWT_INVITE_USER_SECRET"
          valueFrom = "${var.api_secrets_arn}:JWT_INVITE_USER_SECRET::"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${local.name_prefix}-api"
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:4000/health || exit 1"]
        interval = 30
        timeout = 10
        retries = 3
        startPeriod = 60
      }
    }
  ])
  
  tags = var.tags
}

# Task Definition for Web Next
resource "aws_ecs_task_definition" "web_next" {
  family                   = "${local.name_prefix}-web-next"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.web_next_cpu
  memory                   = var.web_next_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn
  
  container_definitions = jsonencode([
    {
      name  = "web-next"
      image = "${var.web_next_ecr_repository_url}:latest"
      
      essential = true
      
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        for key, value in var.web_next_environment_variables : {
          name  = key
          value = value
        }
      ]
      
      secrets = [
        {
          name      = "NEXT_PUBLIC_API_URL"
          valueFrom = "${var.web_next_secrets_arn}:NEXT_PUBLIC_API_URL::"
        },
        {
          name      = "NEXT_PUBLIC_SUPABASE_URL"
          valueFrom = "${var.web_next_secrets_arn}:NEXT_PUBLIC_SUPABASE_URL::"
        },
        {
          name      = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
          valueFrom = "${var.web_next_secrets_arn}:NEXT_PUBLIC_SUPABASE_ANON_KEY::"
        },
        {
          name      = "NEXT_PUBLIC_APP_NAME"
          valueFrom = "${var.web_next_secrets_arn}:NEXT_PUBLIC_APP_NAME::"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${local.name_prefix}-web-next"
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
        interval = 30
        timeout = 10
        retries = 3
        startPeriod = 60
      }
    }
  ])
  
  tags = var.tags
}

# ECS Services
resource "aws_ecs_service" "api" {
  name            = "${local.name_prefix}-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"
  
  platform_version = "LATEST"
  
  network_configuration {
    security_groups  = [var.ecs_security_group_id]
    subnets          = var.private_subnet_ids
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 4000
  }
  
  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 50
    
    deployment_circuit_breaker {
      enable   = true
      rollback = true
    }
  }
  
  enable_execute_command = true
  
  depends_on = [aws_lb_listener.api_https]
  
  tags = var.tags
}

resource "aws_ecs_service" "web_next" {
  name            = "${local.name_prefix}-web-next-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web_next.arn
  desired_count   = var.web_next_desired_count
  launch_type     = "FARGATE"
  
  platform_version = "LATEST"
  
  network_configuration {
    security_groups  = [var.ecs_security_group_id]
    subnets          = var.private_subnet_ids
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.web_next.arn
    container_name   = "web-next"
    container_port   = 3000
  }
  
  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 50
    
    deployment_circuit_breaker {
      enable   = true
      rollback = true
    }
  }
  
  enable_execute_command = true
  
  depends_on = [aws_lb_listener.web_next_https]
  
  tags = var.tags
}

# Auto Scaling for API
resource "aws_appautoscaling_target" "api" {
  max_capacity       = var.api_max_capacity
  min_capacity       = var.api_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api_cpu" {
  name               = "${local.name_prefix}-api-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

resource "aws_appautoscaling_policy" "api_memory" {
  name               = "${local.name_prefix}-api-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}

# Auto Scaling for Web Next
resource "aws_appautoscaling_target" "web_next" {
  max_capacity       = var.web_next_max_capacity
  min_capacity       = var.web_next_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.web_next.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "web_next_cpu" {
  name               = "${local.name_prefix}-web-next-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.web_next.resource_id
  scalable_dimension = aws_appautoscaling_target.web_next.scalable_dimension
  service_namespace  = aws_appautoscaling_target.web_next.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

resource "aws_appautoscaling_policy" "web_next_memory" {
  name               = "${local.name_prefix}-web-next-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.web_next.resource_id
  scalable_dimension = aws_appautoscaling_target.web_next.scalable_dimension
  service_namespace  = aws_appautoscaling_target.web_next.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}

# Data sources
data "aws_region" "current" {} 