package clients

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Create

// CreateLogger creates a new logger for the application.
func CreateLogger(debug bool) *zap.SugaredLogger {
	pe := zap.NewProductionEncoderConfig()

	// fileEncoder := zapcore.NewJSONEncoder(pe)

	pe.EncodeTime = zapcore.ISO8601TimeEncoder
	pe.EncodeLevel = zapcore.CapitalColorLevelEncoder
	consoleEncoder := zapcore.NewConsoleEncoder(pe)

	level := zap.InfoLevel
	if debug {
		level = zap.DebugLevel
	}

	core := zapcore.NewTee(
		// zapcore.NewCore(fileEncoder, zapcore.AddSync(f), level),
		zapcore.NewCore(consoleEncoder, zapcore.AddSync(os.Stdout), level),
	)

	l := zap.New(core)
	return l.Sugar()
}
