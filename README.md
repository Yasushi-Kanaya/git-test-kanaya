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

Actor "User"

Route53(assets, "assets-ess.es-support.jp", "assets", "Aliasレコード")

CloudFront(cf, "assets-ess.es-support.jp", "assets", "TTL3600")

WAF(waf_global, "waf_global", "assets", "") 

User ..> assets
assets -> cf
cf -d- waf_global

@enduml
```
