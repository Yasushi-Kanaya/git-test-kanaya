git-test-kanaya

machigai -> shuusei

branch work01
brabch work02
branch issue2
branch issue3

workflow added

# 構成図
```
@startuml
!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/master/dist
!includeurl AWSPuml/AWSCommon.puml
!includeurl AWSPuml/EndUserComputing/all.puml
!includeurl AWSPuml/Storage/SimpleStorageServiceS3.puml

actor "Person" as personAlias
WorkDocs(desktopAlias, "Label", "Technology", "Optional Description")
SimpleStorageServiceS3(storageAlias, "Label", "Technology", "Optional Description")

personAlias --> desktopAlias
desktopAlias --> storageAlias
@enduml
```
