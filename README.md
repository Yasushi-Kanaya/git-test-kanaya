
# AWS構成図
```
@startuml
!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/master/dist
!includeurl AWSPuml/AWSCommon.puml
!includeurl AWSPuml/NetworkingAndContentDelivery/all.puml

Actor "User"

Route53(assets, "assets-ess", "es-support.jp", "CloudfrontへのAlias")

CloudFront(cf, "assets-ess", "es-support.jp", "TTL3600")

User ..> assets
assets -> cf

@enduml
```
