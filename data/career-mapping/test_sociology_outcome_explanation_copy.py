"""Regression checks for reviewed, learner-facing Sociology outcomes."""

from __future__ import annotations

import importlib.util
import re
from pathlib import Path


BUILDER_PATH = Path(__file__).with_name("_build_sociology_curriculum_contract.py")
SPEC = importlib.util.spec_from_file_location("sociology_contract_builder", BUILDER_PATH)
assert SPEC and SPEC.loader
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)


def test_reviewed_outcome_explanations_are_explanatory_and_remove_truncated_phrases():
    examples = [
        "connect between the two revolutions of the 18th century",
        "explain the thrust of social anthropology which is a distinct field and one that is closely related to sociology, hence social anthropology",
        "appreciate the context for social anthropological works",
        "describe the racist origin of anthropology; and",
        "explain the thrust of psychology as a discipline",
        "distinguish psychology from cognate ones like sociology, social anthropology, psychiatry, social psychology and many others",
        "appreciate the various specialities in psychology and many others",
        "identify methods used in psychological studies and many others",
        "trace the history of psychology, focus of psychology, unit of study in psychology and key concepts",
        "appreciate the history of psychology in Nigeria today",
        "explain their preoccupation with magic, witchcraft and many others which still co-exist side-by-side with science and imported belief-systems of Christianity and Islam",
        "demonstrate total understanding of the peoples of Nigeria/Africa",
        "have an overview of psychological theories of human behaviour/personality development such as theories of Freud, Jung, Piaget and many others; and",
        "describe the Social Institutions (family, economic, education and many others), social change, social control, social inequalities, social problems, and types of society; and",
        "explain some critical concepts in social psychology such as attitude (change and formative), attribution, group dynamics, altruism, reciprocity, warm-glow, social exchange and social learning, prosocial and underlying motives and many others; and",
        "apply the theories of gender inequality, biological theories (Murdock, Alex Thio, Parker and Parker and many others) and cultural theories – Marxism, Feminism, Socialisation",
        "discuss gender disparity in the economy, politics, religion, education and many others",
        "explain the cultural inhibitors of gender equity – Widowhood practices, Early marriage and many others; and",
        "discuss the diversity of social structure – marriage, family types, patrilineal, matrilineal, bilateral and many others",
        "define related concepts like social stratification, social class, equity/inequity and many others",
        "demonstrate an appreciable level of the art of public speaking and listening; and",
        "describe practices like polygamy (polygyny and polyandry), levirate (wife inheritance), food taboos and others targeted at women and children; and",
        "appreciate the historical contributions to scientific thought; the pioneers contributors include, Emile Durkheim, Auguste Comte, Parsons, Karl Marx, Max Weber, Malinowski, Cooley",
        "recognise the limitations in sociology being regarded as a \"science\" like discipline in the physical and biological sciences; and",
        "appreciate the concept of social pathology; major contemporary problems in Nigeria",
        "appreciate the concept of modernisation",
        "define normal, disturbed, and/or problem family units and factors accounting for them; and",
        "account for the functional and dysfunctional practices across the major as well as minor ethnic groups; and",
        "explain the justification for use of one or some or all the methods in social research in human societies; and",
    ]
    for source_text in examples:
        student_text = BUILDER.student_text(source_text)
        assert len(re.findall(r"[.!?](?:\s|$)", student_text)) >= 2, source_text
        assert "many others" not in student_text.casefold(), source_text
        assert not student_text.rstrip().casefold().endswith("and"), source_text


def test_typographically_corrupted_source_outcome_uses_id_scoped_explanation():
    source_text = (
        "account for the difference between factors in focus in the study of economic development as opposed to sociology of development; "
        "identify the contribution of Max Weber to the rise of sociology of development; explain how economic factors like value-system, norms profit, "
        "or other cultural imperatives are key determitants of economic development; and discuss role of non-economic factors in socio-economic "
        "in the rapid developemnt of Nigeria develpoment."
    )
    student_text = BUILDER.student_text(source_text, "SOC 407:1")
    assert "determitants" not in student_text
    assert "developemnt" not in student_text
    assert student_text.startswith("You will compare the questions")
    assert len(re.findall(r"[.!?](?:\s|$)", student_text)) >= 2


def test_unmapped_outcome_removes_only_the_trailing_source_list_connector():
    assert BUILDER.student_text("describe community institutions; and") == (
        "You will learn to describe community institutions"
    )
