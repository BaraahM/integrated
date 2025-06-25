# AWS Deployment Plan - Progressive Scaling Strategy

## 💰 Complete Cost Analysis

### Phase 1: MVP Launch (~$39/month)
**Docker Compose on Single EC2**

| Service | Cost | Details |
|---------|------|---------|
| EC2 t3.small | $15.33/month | 2 vCPU, 2GB RAM, 730 hours |
| Application Load Balancer | $16.20/month | $16.20 base + $0.008/LCU-hour |
| S3 Storage (50GB) | $1.15/month | Standard storage |
| CloudFront (100GB) | $8.50/month | Data transfer |
| Route 53 | $0.50/month | Hosted zone |
| Secrets Manager | $0.40/month | 1 secret |
| CloudWatch Logs (5GB) | $2.50/month | 7-day retention |
| **Total** | **$44.58/month** | **~$535/year** |

### Phase 2: Growth Scale (~$78/month)
**K3s Self-Hosted Kubernetes (2 nodes)**

| Service | Cost | Details |
|---------|------|---------|
| EC2 t3.small (master) | $15.33/month | K3s control plane |
| EC2 t3.small (worker) | $15.33/month | Application workloads |
| Application Load Balancer | $16.20/month | Same as Phase 1 |
| S3 Storage (200GB) | $4.60/month | Increased assets |
| CloudFront (500GB) | $42.50/month | Higher traffic |
| Route 53 | $0.50/month | Same |
| Secrets Manager | $0.40/month | Same |
| CloudWatch Logs (20GB) | $10.00/month | More detailed logging |
| **Total** | **$104.86/month** | **~$1,258/year** |

### Phase 3: Production Scale (~$312/month)
**Managed EKS with High Availability**

| Service | Cost | Details |
|---------|------|---------|
| EKS Control Plane | $72.00/month | Managed Kubernetes |
| EC2 t3.medium × 3 | $90.72/month | 3-node cluster (2 vCPU, 4GB each) |
| Application Load Balancer | $16.20/month | Same |
| S3 Storage (1TB) | $23.00/month | Large asset storage |
| CloudFront (2TB) | $170.00/month | Global distribution |
| Route 53 | $0.50/month | Same |
| RDS PostgreSQL (db.t3.micro) | $13.87/month | Managed database option |
| Secrets Manager | $0.40/month | Same |
| CloudWatch Enhanced | $25.00/month | Detailed monitoring/alerting |
| **Total** | **$411.69/month** | **~$4,940/year** |

## 📊 Migration Criteria & Triggers

### Phase 1 → Phase 2 Migration Triggers

**Business Metrics:**
- Monthly Recurring Revenue: >$1,000
- Active Users: >1,000
- Daily Requests: >10,000
- Team Size: >2 developers

**Technical Indicators:**
- EC2 CPU utilization >70% consistently
- Memory usage >80% regularly
- Deployment downtime becoming critical
- Need for auto-scaling
- Multiple environments required

**Cost Justification:**
- Revenue can support 2.5x infrastructure cost increase
- Downtime costs exceed infrastructure investment

### Phase 2 → Phase 3 Migration Triggers

**Business Metrics:**
- Monthly Recurring Revenue: >$10,000
- Active Users: >10,000
- Daily Requests: >100,000
- Team Size: >5 developers
- Compliance requirements (SOC2, HIPAA)

**Technical Indicators:**
- Need for 99.9% uptime SLA
- Multi-region deployment required
- Complex microservices architecture
- Advanced monitoring/observability needs
- Database scaling requirements

**Cost Justification:**
- Revenue can support 4x infrastructure cost increase
- Enterprise features provide business value

## 🔄 Detailed Migration Procedures

### Phase 1 → Phase 2 Migration (MVP to K3s)

**Preparation (Week 1):**
```bash
# 1. Create K3s infrastructure
cd aws/infrastructure-k3s
terraform plan -var-file="../environments/growth.tfvars"
terraform apply -var-file="../environments/growth.tfvars"

# 2. Install K3s on master node
ssh ec2-user@MASTER_IP
curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644

# 3. Join worker node
ssh ec2-user@WORKER_IP
curl -sfL https://get.k3s.io | K3S_URL=https://MASTER_IP:6443 K3S_TOKEN=<token> sh -
```

**Migration Day (2-hour window):**
```bash
# 1. Convert Docker Compose to Kubernetes manifests
# 2. Deploy applications to K3s cluster
kubectl apply -f k3s/applications/
kubectl apply -f k3s/ingress/

# 3. Update DNS to point to new Load Balancer
# 4. Verify application health
# 5. Terminate old EC2 instance

# Estimated downtime: <5 minutes
```

**Rollback Plan:**
```bash
# If issues occur, rollback DNS to old instance
aws route53 change-resource-record-sets --hosted-zone-id $ZONE_ID --change-batch file://rollback.json
```

### Phase 2 → Phase 3 Migration (K3s to EKS)

**Preparation (Week 1-2):**
```bash
# 1. Create EKS infrastructure
cd aws/infrastructure
terraform plan -var-file="../environments/production.tfvars"
terraform apply -var-file="../environments/production.tfvars"

# 2. Install cluster tools
aws eks update-kubeconfig --name barum-production
helm install external-secrets external-secrets/external-secrets
helm install aws-load-balancer-controller eks/aws-load-balancer-controller
```

**Migration Day (4-hour window):**
```bash
# 1. Backup K3s cluster data
kubectl get all --all-namespaces -o yaml > k3s-backup.yaml

# 2. Deploy applications to EKS
kubectl apply -f kubernetes/namespaces/
kubectl apply -f kubernetes/secrets/
kubectl apply -f kubernetes/applications/
kubectl apply -f kubernetes/ingress/

# 3. Data migration (if using local storage)
# 4. Update DNS to EKS Load Balancer
# 5. Verify all services
# 6. Decommission K3s cluster

# Estimated downtime: <30 minutes
```

## 🛠️ Implementation Files Structure

### Current MVP Setup (Phase 1)
```
aws/
├── infrastructure-mvp/          # ✅ Current MVP infrastructure
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── scripts/                     # ✅ EC2 setup scripts
│   └── setup-docker-compose.sh
└── environments/
    └── mvp.tfvars              # ✅ MVP configuration
```

### Future Growth Setup (Phase 2)
```
aws/
├── infrastructure-k3s/          # 🔜 To be created when needed
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── k3s/                        # 🔜 K3s manifests
│   ├── applications/
│   └── ingress/
└── environments/
    └── growth.tfvars           # 🔜 Growth configuration
```

### Future Production Setup (Phase 3)
```
aws/
├── infrastructure/              # 🔜 Full EKS infrastructure
├── kubernetes/                  # 🔜 Production K8s manifests
└── environments/
    └── production.tfvars       # 🔜 Production configuration
```

## 🧹 Cleaned Up Approach

**What to Use Now:**
- ✅ `aws/infrastructure-mvp/` - MVP Terraform
- ✅ `aws/scripts/setup-docker-compose.sh` - EC2 setup
- ✅ `docker-compose.prod.yml` - Container orchestration
- ✅ `.gitlab-ci.yml` - Simplified CI/CD
- ✅ `docs/MVP_SETUP.md` - Setup guide

**What to Ignore for Now:**
- ❌ Kubernetes manifests (create when migrating to Phase 2)
- ❌ EKS infrastructure (create when migrating to Phase 3)
- ❌ Complex monitoring setup (start simple)

## 📈 Success Metrics Dashboard

### Phase 1 KPIs to Monitor
```bash
# Business Metrics
- Monthly Revenue: $0 → $1,000
- Active Users: 0 → 1,000
- Daily API Calls: 0 → 10,000

# Technical Metrics
- Response Time: <200ms (95th percentile)
- Uptime: >99.5%
- CPU Usage: <70%
- Memory Usage: <80%

# Cost Metrics
- Cost per User: <$0.05
- Infrastructure % of Revenue: <5%
```

### Migration Decision Matrix

| Metric | Phase 1 Target | Phase 2 Trigger | Phase 3 Trigger |
|--------|----------------|-----------------|-----------------|
| MRR | $0-$1K | >$1K | >$10K |
| Users | 0-1K | >1K | >10K |
| Requests/day | 0-10K | >10K | >100K |
| Team Size | 1-2 | >2 | >5 |
| Infrastructure Cost | $45/mo | $105/mo | $412/mo |
| Revenue % on Infra | 100% → 4.5% | <10% | <4% |

## ⚡ Quick Start Commands

```bash
# Start with MVP (Phase 1)
cd aws/infrastructure-mvp
terraform init
terraform apply -var-file="../environments/mvp.tfvars"

# When ready for Phase 2 (6-12 months later)
# Create K3s infrastructure and migrate

# When ready for Phase 3 (12-24 months later)  
# Create EKS infrastructure and migrate
```

## 💡 Cost Optimization Tips per Phase

### Phase 1 Optimizations
- Use t3.micro for development environment
- Set CloudWatch log retention to 3 days
- Use S3 lifecycle policies for old assets
- Monitor with AWS Cost Anomaly Detection

### Phase 2 Optimizations
- Consider Spot Instances for worker nodes
- Use Reserved Instances with 1-year commitment
- Implement container resource limits
- Set up automated scaling policies

### Phase 3 Optimizations
- Use Savings Plans for EC2 and Fargate
- Implement cost allocation tags
- Use CloudWatch Container Insights
- Consider multi-region cost optimization

Your progressive scaling strategy is now optimized for cost-effectiveness with clear migration paths! 🚀 