run:
	@go run cmd/main.go

postgresinit:
	docker run --name chatdb -p 5433:5432 -e POSTGRESS_USER=root POSTGRES_PASSWORD=password -d postgres:15-alpine

postgres:
	docker exec -it chatdb psql

createdb:
	docker exec -it chatdb createdb --username=root --owner=root go-chat

dropdb:
	docker exec -it chatdb dropdb go-chat

migrateup:
	migrate -path db/migrations -database "postgresql://root:password@localhost:5433/go-chat?sslmode=disable" -verbose up

migratedown:
		migrate -path db/migrations -database "postgresql://root:password@localhost:5433/go-chat?sslmode=disable" -verbose down

.PHONY: postgresinit postgres createdb dropdb migrateup migratedown

