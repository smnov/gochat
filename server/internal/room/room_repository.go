package room

import (
	"context"
	"database/sql"
)

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	PrepareContext(context.Context, string) (*sql.Stmt, error)
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
}

type repository struct {
	db DBTX
}

func (r *repository) CreateRoom(ctx context.Context, id, name string) (*RoomDB, error) {
	req := &RoomDB{
		ID:   id,
		Name: name,
	}
	query := "INSERT INTO rooms (id, owner_id) VALUES ($1, $2)"
	err := r.db.QueryRowContext(context.Background(), query).Scan(&req)
	if err != nil {
		return nil, err
	}
	return req, nil
}

func (r *repository) GetRoomsFromDB(ctx context.Context) ([]*RoomDB, error) {
	query := "SELECT * FROM rooms"
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []*RoomDB
	for rows.Next() {
		var room RoomDB
		if err := rows.Scan(&room.ID, &room.Name); err != nil {
			return nil, err
		}
		rooms = append(rooms, &room)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return rooms, nil
}
