---
title: API部分
description: 基于此SDK，快速调用aPaaS平台能力
keywords: [Mybricks,Mybricks低代码,低代码,无代码,图形化编程]
---

# 介绍

> 目前关于aPaaS平台相关的服务能力，均封装到各自领域内，供开发者调用，前后端均可调用

接下来就来介绍关于平台的几大顶层领域服务，所有领域服务均挂载在API这个对象上。

```ts
import API from '@mybricks/sdk-for-app/api';
```

## File

在我们看来任意搭建资产皆为**文件**，因此围绕着文件域，我们构建了涵盖了 查询、保存、发布全链路的API供开发者调用。（以下API使用详细姿势，可参考SDK的ts定义，再次不再赘述）

### 查询页面搭建数据
此接口会返回基本页面数据以及最新的保存数据（如有）

```ts
const data = await API.File.getFullFile({ fileId: xxx })
```

### 保存
调用此接口可以将页面的 `搭建数据` 持久化到aPaaS服务的数据库中

```ts
const res = await API.File.save({
  userId,
  fileId,
  content
})
```

### 发布
调用此接口可以将页面的 `发布结果` 持久化到aPaaS服务的数据库中

```ts
const res = await API.File.publish({
  userId,
  fileId,
  extName,
  content,
  type: envType,
});
```


### 查询历史发布版本
查询不同环境下历史发布版本

```ts
const res = await API.File.getPublishVersions({
  fileId,
  pageIndex,
  pageSize,
  type
});
```