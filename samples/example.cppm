// Module interface: open as .cppm or .ixx.
export module math.vector;
import <array>;

export template <typename T>
concept Scalar = requires(T value) { value + value; };

export template <Scalar T>
constexpr T twice(T value) noexcept { return value + value; }

// Raw delimiters, digit separators, integer suffixes and modern literals.
constexpr auto message = u8R"note(embedded "quotes" and \slashes)note";
constexpr auto mask = 0b1010'1100ULL;
constexpr auto fraction = .5;
constexpr auto hex_fraction = 0x1.fp+2;
