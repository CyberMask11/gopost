package repository

import (
	"database/sql"
	"gopost/models"
)

type UserRepository interface {
	CreateUser(user models.User) (string, error)
	GetUsers() ([]models.User, error)
	UpdateUser(user models.User, id string) (sql.Result, error)
	DeleteUser(id string) error
	UserExist(username string) (models.User, error)
	RefreshToken(refresh_token models.Refresh_Tokens) (sql.Result, error)
	GetToken(token string) (models.Refresh_Tokens, error)
}

type Repository struct {
	db *sql.DB
}

func NewRepo(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateUser(user models.User) (string, error) {
	if _, err := r.db.Exec("INSERT INTO users (username, password) VALUES ($1, $2)",
		user.Username, user.Password); err != nil {
		return "", err
	}

	return user.Username, nil
}

func (r *Repository) GetUsers() ([]models.User, error) {
	var user models.User

	getusers, err := r.db.Query("SELECT * FROM users")
	if err != nil {
		return nil, err
	}
	defer getusers.Close()

	var users []models.User
	for getusers.Next() {
		if err := getusers.Scan(
			&user.ID, &user.Username, &user.Password, &user.Role,
		); err != nil {
			return nil, err
		}

		users = append(users, user)
	}
	return users, nil
}

func (r *Repository) UpdateUser(user models.User, id string) (sql.Result, error) {
	result, err := r.db.Exec("UPDATE users SET username = $1, password = $2, role = $3 WHERE ID = $4",
		user.Username, user.Password, user.Role, id)

	if err != nil {
		return nil, err
	}

	return result, nil
}

func (r *Repository) DeleteUser(id string) error {
	if _, err := r.db.Exec("DELETE FROM users WHERE ID = $1", id); err != nil {
		return err
	}
	return nil
}

func (r *Repository) UserExist(username string) (models.User, error) {
	var user models.User
	if err := r.db.QueryRow("SELECT * FROM users WHERE username = $1", username).Scan(
		&user.ID, &user.Username, &user.Password, &user.Role,
	); err != nil {
		return models.User{}, err
	}

	return user, nil
}

func (r *Repository) RefreshToken(refresh_token models.Refresh_Tokens) (sql.Result, error) {
	CreateToken, err := r.db.Exec("INSERT INTO refresh_tokens (token, userid, expires_at) VALUES ($1, $2, $3)",
		refresh_token.Token, refresh_token.Userid, refresh_token.ExpiresAt)

	if err != nil {
		return nil, err
	}

	return CreateToken, nil
}

func (r *Repository) GetToken(token string) (models.Refresh_Tokens, error) {
	var refreshToken models.Refresh_Tokens

	if err := r.db.QueryRow("SELECT * FROM refresh_tokens WHERE token = $1", token).Scan(
		&refreshToken.ID, &refreshToken.Userid, &refreshToken.Token, &refreshToken.ExpiresAt,
	); err != nil {
		return models.Refresh_Tokens{}, err
	}

	return refreshToken, nil
}
