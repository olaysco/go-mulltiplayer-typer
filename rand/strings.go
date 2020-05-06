package rand

import (
	"math/rand"
	"time"
)

var seededRand *rand.Rand = rand.New(rand.NewSource(time.Now().UnixNano()))

const charset = "abcdefghijklmnopqrstuvwxyz" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYX0123456789"

func init() {

}

/*StringWithCharset will take the legth of random
*and the set of characters to generate it from
 */
func StringWithCharset(length int, charset string) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

/*String takes the length of the random number
*and returns random strings using the default characters
 */
func String(length int) string {
	return StringWithCharset(length, charset)
}
