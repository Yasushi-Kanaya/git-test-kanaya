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
!define AWSPUML https://raw.githubusercontent.com/milo-minderbinder/AWS-PlantUML/release/18-2-22/dist

!includeurl AWSPUML/ApplicationServices/AmazonAPIGateway/AmazonAPIGateway.puml
!includeurl AWSPUML/common.puml
!includeurl AWSPUML/Storage/AmazonS3/AmazonS3.puml
!includeurl AWSPUML/Storage/AmazonS3/bucket/bucket.puml
!includeurl AWSPUML/Compute/AWSLambda/AWSLambda.puml
!includeurl AWSPUML/Compute/AWSLambda/LambdaFunction/LambdaFunction.puml

LAMBDAFUNCTION(push,UserComment)
        LAMBDAFUNCTION(filter,Filtering)

AMAZONAPIGATEWAY(api)

AMAZONS3(temp, "Temp")
AMAZONS3(date, "User data")

user1 -d-> api
user2 -d-> api
user3 -d-> api

api --> push
push -d-> temp
temp -u-> filter
filter -d-> date
@enduml
```
