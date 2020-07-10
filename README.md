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

3.Push後、GitHubで表示・確認するする

# 構成図
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

WAF(waf_global, "waf_global", "assets", "DefaultAction 本番:Allow 他:Block")
WAFFilteringrule(waf_rule_office, "Allow:office", "assets", "東京DCのIP")
WAFFilteringrule(waf_rule_permanent, "Block:permanent", "assets", "ブロックするIP(Jenkins管理)")
WAFFilteringrule(waf_rule_ua, "Block:useragent", "assets", "ブロックするUserAgent")

S3Bucket(s3_bucket_assets, "assets-ess", "assets", "OriginAccessIdentity:Cloudfront")
S3Object(s3_v1, "v1", "assets", "バージョン")
S3Object(s3_assets, "yyyymmddHHMM", "assets", "実際のasset")

' API(Backend)
Route53(dns_api, "v1ess.es-support.jp", "API", "Aliasレコード")
ELBApplicationLoadBalancer(alb, "v1ess.es-support.jp", "API", "https-only(443)")
frame "TargetGroup" {
  [v1ess-external-8080]
}

WAF(waf_regional, "waf_regional", "API", "DefaultAction 本番:Allow 他:Block")
WAFFilteringrule(waf_regional_rule_permanent, "Block:permanent", "API", "ブロックするIP(Jenkins管理)")
WAFFilteringrule(waf_regional_rule_office, "Allow:office", "API", "東京DCのIP")
WAFFilteringrule(waf_regional_rule_rateLimit, "Block:rateLimit", "API", "5000req/5min")
WAFFilteringrule(waf_regional_rule_static, "Allow:static", "API", "Negated")
WAFFilteringrule(waf_regional_rule_polling, "Allow:pollinc", "API", "Negated")
WAFFilteringrule(waf_regional_rule_regex, "Allow:regex", "API", "Negated")

ElasticContainerService(ecs, "ECS", "API", "cluster")
ECSService(ecs_service, "application", "API", "count:1")
Fargate(fargate, "Fargate" , "API")
package "task_definition"
ECSContainer1(ess_app, "ess-api.jar", "API", "port:8080,cpu:1024,mem:8192")

' Registry
EC2ContainerRegistry(ecr, "v1/ess/image", "API", "openjdk:11.0-jdk")

' Credencials
SystemsManagerParameterStore(param_store, "credencials", "DB,ES,Recaptcha")
IAMResource(iam_circleci, "v1apps-deploy-circleci", "ECS,ECRの権限")

'
' レイアウト
'
User ..> dns_assets
User ..> dns_api

' assets(Frontend)
dns_assets -> cf

cf -r-> s3_bucket_assets
cf -d- waf_global

waf_global -d-> waf_rule_office
waf_rule_office -r-> waf_rule_permanent
waf_rule_permanent -r-> waf_rule_ua

s3_bucket_assets -d- s3_v1
s3_v1 -d- s3_assets

' API(Backend)
dns_api -> alb

alb -d- tg
tg -d- ecs_service

alb -d- waf_regional
waf_regional -d-> waf_regional_rule_permanent
waf_regional_rule_permanent -r-> waf_regional_rule_office
waf_regional_rule_office -r-> waf_regional_rule_rateLimit
waf_regional_rule_rateLimit -d-> waf_regional_rule_static
waf_regional_rule_static -r-> waf_regional_rule_polling
waf_regional_rule_polling -r-> waf_regional_rule_regex

ecs -d- ecs_service
ecs_service -d- fargate
fargate -d- task_definition
task_definition -d- ess_app

@enduml
```
