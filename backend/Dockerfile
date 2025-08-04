# syntax=docker/dockerfile:1


FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build

COPY . /source

WORKDIR /source/server

RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish --use-current-runtime --self-contained false -o /app
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app

COPY --from=build /app .

USER $APP_UID

EXPOSE 8080

ENTRYPOINT ["dotnet", "server.dll"]
