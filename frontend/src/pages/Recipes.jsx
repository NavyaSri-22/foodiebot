
import { useState } from "react";
import {
    Search,
    ChefHat,
    Clock,
    Utensils,
    Shuffle,
    BookOpen
} from "lucide-react";

const API = "https://www.themealdb.com/api/json/v1/1";

function Recipes() {
    const [search, setSearch] = useState("");
    const [searchType, setSearchType] = useState("name");
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const searchRecipes = async () => {
        if (!search.trim()) {
            setError("Please enter a food name or ingredient.");
            return;
        }

        setLoading(true);
        setError("");
        setSelectedRecipe(null);

        try {
            const endpoint = searchType === "name"
                ? `${API}/search.php?s=${encodeURIComponent(search.trim())}`
                : `${API}/filter.php?i=${encodeURIComponent(search.trim())}`;

            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error("Unable to connect to recipe service.");
            }

            const data = await response.json();

            setRecipes(data.meals || []);

            if (!data.meals) {
                setError("No recipes found. Try another search.");
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    const getRandomRecipe = async () => {
        setLoading(true);
        setError("");
        setSelectedRecipe(null);

        try {
            const response = await fetch(`${API}/random.php`);
            if (!response.ok) throw new Error("Unable to load random recipe.");

            const data = await response.json();
            setRecipes(data.meals || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRecipeDetails = async (id) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API}/lookup.php?i=${id}`);
            if (!response.ok) throw new Error("Unable to load recipe details.");

            const data = await response.json();
            setSelectedRecipe(data.meals?.[0] || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getIngredients = (meal) => {
        const items = [];

        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`]?.trim();
            const measure = meal[`strMeasure${i}`]?.trim();

            if (ingredient) {
                items.push(`${measure || ""} ${ingredient}`.trim());
            }
        }

        return items;
    };

    return (
        <div className="recipes-page">

            <section className="recipes-hero">
                <span className="recipes-eyebrow">
                    DISCOVER DELICIOUS FOOD
                </span>

                <h1>Find your next favourite recipe!</h1>

                <p>
                    Explore delicious meals, discover new flavours
                    and learn how to cook something amazing.
                </p>

                <div className="recipe-search">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        <option value="name">Food name</option>
                        <option value="ingredient">Ingredient</option>
                    </select>

                    <input
                        type="text"
                        placeholder={
                            searchType === "name"
                                ? "Search recipes... e.g. Chicken"
                                : "Enter ingredient... e.g. Chicken"
                        }
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") searchRecipes();
                        }}
                    />

                    <button onClick={searchRecipes} disabled={loading}>
                        <Search size={18} />
                        Search
                    </button>
                </div>

                <button
                    className="random-recipe-btn"
                    onClick={getRandomRecipe}
                    disabled={loading}
                >
                    <Shuffle size={17} />
                    Surprise Me With a Recipe
                </button>
            </section>

            {loading && (
                <p className="recipe-status">Finding delicious recipes...</p>
            )}

            {error && (
                <p className="recipe-error">{error}</p>
            )}

            {selectedRecipe && (
                <section className="recipe-details">
                    <button
                        className="recipe-back-btn"
                        onClick={() => setSelectedRecipe(null)}
                    >
                        ← Back to recipes
                    </button>

                    <img
                        src={selectedRecipe.strMealThumb}
                        alt={selectedRecipe.strMeal}
                    />

                    <h2>{selectedRecipe.strMeal}</h2>

                    <p>
                        {selectedRecipe.strCategory || "Meal"} ·{" "}
                        {selectedRecipe.strArea || "International"}
                    </p>

                    <h3>Ingredients</h3>

                    <ul>
                        {getIngredients(selectedRecipe).map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>

                    <h3>Cooking Instructions</h3>

                    <p className="recipe-instructions">
                        {selectedRecipe.strInstructions}
                    </p>

                    {selectedRecipe.strYoutube && (
                        <a
                            href={selectedRecipe.strYoutube}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Watch Cooking Video
                        </a>
                    )}
                </section>
            )}

            {!selectedRecipe && (
                <section className="recipe-results">
                    <div className="recipe-section-heading">
                        <div>
                            <h2>
                                <ChefHat size={24} />
                                {recipes.length
                                    ? "Recipe Suggestions"
                                    : "Explore Recipes"}
                            </h2>

                            <p>
                                {recipes.length
                                    ? `${recipes.length} recipes found`
                                    : "Search by food name or ingredient to get started."}
                            </p>
                        </div>
                    </div>

                    <div className="recipe-grid">
                        {recipes.map((recipe) => (
                            <article
                                className="recipe-card"
                                key={recipe.idMeal}
                            >
                                <img
                                    src={recipe.strMealThumb}
                                    alt={recipe.strMeal}
                                />

                                <div className="recipe-card-content">
                                    <h3>{recipe.strMeal}</h3>

                                    <p>
                                        <Utensils size={15} />
                                        {recipe.strArea || recipe.strCategory || "Delicious meal"}
                                    </p>

                                    <button
                                        onClick={() => getRecipeDetails(recipe.idMeal)}
                                        disabled={loading}
                                    >
                                        <BookOpen size={16} />
                                        View Recipe
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default Recipes;
