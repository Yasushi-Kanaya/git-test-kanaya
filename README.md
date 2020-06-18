
# AWS構成図
```
@startuml
!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/master/dist
!includeurl AWSPuml/AWSCommon.puml
!includeurl AWSPuml/NetworkingAndContentDelivery/all.puml

Agent "User"

Route53(assets, "assets-ess", "es-support.jp", "CloudfrontへのAlias")



User -> assets

@enduml
```
