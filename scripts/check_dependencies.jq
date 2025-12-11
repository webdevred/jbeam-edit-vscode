to_entries
| map(
    select(
      (.key as $k |
        ($deps | index($k))
        and
        (($ignore // []) | index($k) | not)
      )
    )
)

