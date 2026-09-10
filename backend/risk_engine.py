def calculate_final_risk(
    image_result,
    numerical_result
):

    image_score = image_result["max_probability"]

    numerical_score = numerical_result[
        "high_risk_probability"
    ]


    # ------------------------------------------------
    # FALCON fusion
    # ------------------------------------------------

    final_score = (
        0.50 * image_score +
        0.50 * numerical_score
    )


    # 0–1 → 0–100

    score = final_score * 100


    # ------------------------------------------------
    # Risk level
    # ------------------------------------------------

    if score >= 75:

        level = "CRITICAL"

    elif score >= 50:

        level = "HIGH"

    elif score >= 25:

        level = "MODERATE"

    else:

        level = "LOW"


    return {
        "final_score": round(score, 2),
        "risk_level": level
    }