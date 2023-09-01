# README

`AWS::Lambda::Function` や `AWS::CodeBuild::Project` のように環境変数を扱う CloudFormation リソースを使っていて、これらに対する環境変数の設定をシェルの実行環境 (`process.env`) から注入しているケースが前提。

CDK snapshot testing をする際、上記のようなリソースにおける環境変数は CloudFormation リソースの一部であるため snapshot の一部としてコミット対象になってしまう。

環境変数の値を `.env` などのバージョン管理から外れた場所で管理しコミットに載せないようにする手法は広く用いられているパターンだが、CDK snapshot testing のスタンダードな方法ではこれが意図せず崩れる可能性がある。

このレポジトリでは CDK snapshot testing を行いつつも、上述のリソースに設定された環境変数が snapshot にはマスクされた状態で反映されるようにする実装を示す。
