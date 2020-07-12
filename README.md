# PlantUMLの表示/記載方法
1.Chromeプラグインのインストール
https://chrome.google.com/webstore/detail/pegmatite/jegkfbnfbfnohncpcfcimepibmhlkldo?hl=ja

2.README.md に、PlantUMLを記載する
```
@startuml
Actor "user"
Agent "sample"

user -> sample
@enduml
```

3.Push後、GitHubで表示・確認する

# 構成図(frontend)
```
@startuml
'AWS
!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/master/dist
!includeurl AWSPuml/AWSCommon.puml
!includeurl AWSPuml/Compute/all.puml
!includeurl AWSPuml/ManagementAndGovernance/all.puml
!includeurl AWSPuml/NetworkingAndContentDelivery/all.puml
!includeurl AWSPuml/SecurityIdentityAndCompliance/all.puml
!includeurl AWSPuml/Storage/all.puml

Actor "User"

' SSL
CertificateManager(ssl, "*.es-support.jp", "AutoUpdate")

' Assets(Frontend)
Route53(dns_assets, "assets-ess.es-support.jp", "assets", "Aliasレコード")

CloudFront(cf, "assets-ess.es-support.jp", "assets", "TTL3600")

frame "WAF_global" {
  WAF(waf_global, "waf_global", "assets", "DefaultAction 本番:Allow 他:Block")
  WAFFilteringrule(waf_rule_office, "Allow:office", "assets", "東京DCのIP")
  WAFFilteringrule(waf_rule_permanent, "Block:permanent", "assets", "ブロックするIP(Jenkins管理)")
  WAFFilteringrule(waf_rule_ua, "Block:useragent", "assets", "ブロックするUserAgent")
}

frame "S3" {
  S3Bucket(s3_bucket_assets, "assets-ess", "assets", "OriginAccessIdentity:Cloudfront")
  S3Object(s3_v1, "v1", "assets", "バージョン")
  S3Object(s3_assets, "yyyymmddHHMM", "assets", "実際のasset")
}

' Credencials
IAMResource(iam_circleci, "v1apps-deploy-circleci", "ECS,ECR,S3の権限")

' CI
cloud "CircleCI" {
  [build&push]
  [deploy]
}

'
' レイアウト
'
User ..d..> dns_assets

' assets(Frontend)
dns_assets -d-> cf

ssl .. cf
cf -d-> s3_bucket_assets :Allow CF
cf <-d-> waf_global

waf_global -d-> waf_rule_office
waf_rule_office -d-> waf_rule_permanent
waf_rule_permanent -d-> waf_rule_ua

s3_bucket_assets -d- s3_v1
s3_v1 -d- s3_assets

[build&push]
[deploy] -u-> s3_assets
CircleCI .. iam_circleci

@enduml
```

# 構成図(backend)
```
@startuml
'AWS
!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/master/dist
!includeurl AWSPuml/AWSCommon.puml
!includeurl AWSPuml/Compute/all.puml
!includeurl AWSPuml/ManagementAndGovernance/all.puml
!includeurl AWSPuml/NetworkingAndContentDelivery/all.puml
!includeurl AWSPuml/SecurityIdentityAndCompliance/all.puml
!includeurl AWSPuml/Storage/all.puml

Actor "User"

' SSL
CertificateManager(ssl, "*.es-support.jp", "AutoUpdate")

' API(Backend)
Route53(dns_api, "v1ess.es-support.jp", "API", "Aliasレコード")
ELBApplicationLoadBalancer(alb, "v1ess.es-support.jp", "API", "https-only(443)")
frame "TargetGroup" {
  [v1ess-external-8080]
}

frame "WAF_regional" {
  WAF(waf_regional, "waf_regional", "API", "DefaultAction 本番:Allow 他:Block")
  WAFFilteringrule(waf_regional_rule_permanent, "Block:permanent", "API", "ブロックするIP(Jenkins管理)")
  WAFFilteringrule(waf_regional_rule_office, "Allow:office", "API", "東京DCのIP")
  WAFFilteringrule(waf_regional_rule_rateLimit, "Block:rateLimit", "API", "5000req/5min")
  frame "Negated(除外)" {
    WAFFilteringrule(waf_regional_rule_static, "Allow:static", "API", "Negated")
    WAFFilteringrule(waf_regional_rule_polling, "Allow:pollinc", "API", "Negated")
    WAFFilteringrule(waf_regional_rule_regex, "Allow:regex", "API", "Negated")
  }
}

frame "ECS" {
  ECSService(ecs_service, "application", "API", "count:1")
  Fargate(fargate, "Fargate" , "API")
  package "task_definition" {
    [port:8080]
    [cpu:1024]
    [mem:8192mb]
    [DB,ES_credential] 
    [image]
  }
  ECSContainer1(ess_app, "ess-api.jar", "API", "GraphQL,JOOQ")
}

' Registry
cloud "AWS_central" {
  EC2ContainerRegistry(ecr, "v1/ess/image", "API", "openjdk:11.0-jdk")
  IAMResource(iam_central, "biz-ctlreach-ecr", "ECRの権限")
}

' Credencials
SystemsManagerParameterStore(param_store, "credencials", "DB,ES,Recaptcha")
IAMResource(iam_circleci, "v1apps-deploy-circleci", "ECSの権限")

' CI
cloud "CircleCI" {
  [build&push]
  [deploy]
}

'
' レイアウト
'
User ..d..> dns_api

' API(Backend)
dns_api -d-> alb

ssl .. alb

alb <-l-> waf_regional
waf_regional -d-> waf_regional_rule_permanent
waf_regional_rule_permanent -d-> waf_regional_rule_office
waf_regional_rule_office -d-> waf_regional_rule_rateLimit
waf_regional_rule_rateLimit <-d-> waf_regional_rule_static
waf_regional_rule_static -d-> waf_regional_rule_polling
waf_regional_rule_polling -d-> waf_regional_rule_regex

alb -r-> [v1ess-external-8080]
[v1ess-external-8080] -d-> ecs_service

ecs_service -d- fargate
fargate -r- ess_app
ess_app ..d.. task_definition
[image] ..r.. ecr
[DB,ES_credential] ..d.. param_store

[build&push] -u-> ecr
[deploy] -u-> ecs_service
[deploy] -u-> task_definition
[deploy] .. iam_circleci
[deploy] .. iam_central

@enduml
```
