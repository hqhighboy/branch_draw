# Dify API密钥获取指南

本指南将帮助您在本地Docker安装的Dify实例中找到并获取API密钥。

## 步骤1: 登录Dify

打开浏览器，访问您的本地Dify实例：[http://localhost/apps](http://localhost/apps)

![Dify登录界面](https://i.imgur.com/example1.png)

## 步骤2: 进入应用列表

登录后，您将看到Dify的主界面。在左侧菜单中，点击"应用"选项。

![Dify主界面](https://i.imgur.com/example2.png)

## 步骤3: 选择应用

在应用列表中，选择您要使用的应用。如果您还没有创建应用，请先创建一个。

![Dify应用列表](https://i.imgur.com/example3.png)

## 步骤4: 访问API参考

在应用详情页面，找到并点击"API访问"或"API参考"选项卡。

![Dify应用详情](https://i.imgur.com/example4.png)

## 步骤5: 获取API密钥

在API访问页面，您可以找到API密钥。通常有两种类型的密钥：

1. **API Key**: 用于前端应用访问
2. **Secret Key**: 用于后端服务访问

对于我们的集成，您需要使用**Secret Key**。

![Dify API密钥](https://i.imgur.com/example5.png)

## 步骤6: 复制API密钥

点击"复制"按钮，将API密钥复制到剪贴板。

## 注意事项

- API密钥是敏感信息，请妥善保管，不要泄露给他人
- 如果您怀疑API密钥已泄露，请立即重新生成
- 重新生成API密钥后，您需要更新所有使用该密钥的应用

## 常见问题

### 找不到API访问选项卡

如果您找不到API访问选项卡，请确保：

1. 您已登录Dify
2. 您有权限访问该应用
3. 该应用支持API访问

### API密钥不起作用

如果您的API密钥不起作用，请检查：

1. 密钥是否正确复制（没有多余的空格）
2. 您是否使用了正确类型的密钥（API Key vs Secret Key）
3. 密钥是否已过期或被重新生成

如果问题仍然存在，请尝试重新生成API密钥。
