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

# AWS構成図
```
@startuml
'AWS
!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/master/dist
!includeurl AWSPuml/AWSCommon.puml
!includeurl AWSPuml/NetworkingAndContentDelivery/all.puml
!includeurl AWSPuml/SecurityIdentityAndCompliance/all.puml

' WAFFilteringrule(waf_rule_rateLimit, "Block_rate", "assets", "5000req/5min")

Actor "User"

Route53(assets, "assets-ess.es-support.jp", "assets", "Aliasレコード")

CloudFront(cf, "assets-ess.es-support.jp", "assets", "TTL3600")

WAF(waf_global, "waf_global", "assets", "DefaultAction 本番:Allow 他:Block")
WAFFilteringrule(waf_rule_office, "Allow:office", "assets", "東京DCのIP")
WAFFilteringrule(waf_rule_permanent, "Block:permanent", "assets", "ブロックするIP(Jenkins管理)")
WAFFilteringrule(waf_rule_ua, "Block:useragent", "assets", "ブロックするUserAgent")

User ..> assets

assets -> cf

cf -d- waf_global
waf_global -d-> waf_rule_office
waf_rule_office -r-> waf_rule_permanent
waf_rule_permanent -r-> waf_rule_ua

@enduml
```
