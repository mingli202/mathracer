# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY ["server/server.csproj", "./server/"]
RUN dotnet restore "server/server.csproj"

COPY server/. ./server/
WORKDIR "/app/server"

EXPOSE 5103

CMD ["dotnet", "watch", "--non-interactive"]
