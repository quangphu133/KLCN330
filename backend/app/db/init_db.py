from sqlalchemy.orm import Session

from app.db.database import Base, SessionLocal, engine
from app.models.vocabulary import Vocabulary
from app.services.rule_service import FORBIDDEN_RULES, MANDATORY_RULES


def seed_regex_vocabularies(db: Session) -> None:
    """Insert built-in regex entries without replacing user-edited values."""
    mandatory_names = {
        "greeting": "Regex | Lời chào bắt buộc",
        "closing": "Regex | Lời kết thúc bắt buộc",
    }
    definitions = [
        {
            "name": mandatory_names[rule_name],
            "pattern": rule_info["pattern"],
            "type": "OnlyOperator",
            "color_hex": "#5B8DEF",
        }
        for rule_name, rule_info in MANDATORY_RULES.items()
    ]
    definitions.extend(
        {
            "name": f"Regex | {rule['type']}",
            "pattern": rule["pattern"],
            "type": "OnlyOperator",
            "color_hex": "#E56363",
        }
        for rule in FORBIDDEN_RULES
    )
    names = [item["name"] for item in definitions]
    existing_names = {
        name
        for (name,) in db.query(Vocabulary.name)
        .filter(Vocabulary.name.in_(names))
        .all()
    }
    for item in definitions:
        if item["name"] not in existing_names:
            db.add(
                Vocabulary(
                    name=item["name"],
                    is_active=True,
                    type=item["type"],
                    color_hex=item["color_hex"],
                    data={"phrases": [item["pattern"]]},
                )
            )
    db.commit()


def initialize_database() -> None:
    """Create missing tables and seed built-in regex entries before startup."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_regex_vocabularies(db)


if __name__ == "__main__":
    initialize_database()
