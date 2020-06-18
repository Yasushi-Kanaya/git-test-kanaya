
# AWS構成図
```
@startuml
!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/master/dist
!includeurl AWSPuml/AWSCommon.puml
!includeurl AWSPuml/NetworkingAndContentDelivery/Route53.puml

Route53(assets, "assets-ess", "es-support.jp", "CloudFormationへのAlias")

@enduml
```
