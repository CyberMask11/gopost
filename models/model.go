package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username" binding:"required"`
	Password string    `json:"password" binding:"required,min=8"`
	Role     string    `json:"role"`
}

type Post struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Title    string    `json:"title" binding:"required"`
	Content  string    `json:"content" binding:"required"`
	Userid   uuid.UUID `json:"userid"`
}

type Refresh_Tokens struct {
	ID        uuid.UUID `json:"id"`
	Userid    string    `json:"userid"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expiresat"`
}

type Data struct {
	Refresh_Token string `json:"refresh_token"`
}
